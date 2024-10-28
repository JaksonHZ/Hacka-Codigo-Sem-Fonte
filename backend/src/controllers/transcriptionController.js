const Transcription = require('../models/Transcription');
const { admin } = require('../config/firebase');
const ffmpeg = require('fluent-ffmpeg');
require('dotenv').config();
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const Task = require('../models/task');
const ToolCategory = require('../models/toolCategory');

// Inicializa a API do OpenAI para usar nas requisições de transcrição
const openai = new OpenAI();

// Define a classe TranscriptionController, que controla as funções relacionadas às transcrições
class TranscriptionController {
  static async createTranscription(req, res) {
     // Obtém o arquivo enviado pelo usuário (via multipart/form-data) e o ID do usuário autenticado
    const file = req.file;
    const userId = req.user.uid;

    try {
      // Criar registro no banco de dados
      const transcription = await Transcription.create({
        userId, // ID do usuário autenticado
        originalFileName: file.filename, // Nome original do arquivo
      });
      

      // Iniciar processamento assíncrono
      const response = await TranscriptionController.processTranscription(transcription, file.path);

      // Responde imediatamente ao usuário que o arquivo foi recebido e será processado
      res.status(200).json(response);
    } catch (error) {
      // Em caso de erro ao criar a transcrição, aparece o erro e responde com erro 500
      console.error('Erro ao criar transcrição:', error);
      res.status(500).json({ error: 'Erro ao criar transcrição' });
    }
  }

  // Método que faz o processamento da transcrição (conversão para MP3 e chamada à API da OpenAI)
  static async processTranscription(transcription, filePath) {
    try {

      let mp3Path = filePath;

      // Verifica o tipo do arquivo e converte para MP3 se necessário
      if (path.extname(filePath).toLowerCase() === '.mp4') {
        mp3Path = `${filePath}.mp3`;
        await TranscriptionController.convertToMp3(filePath, mp3Path);
      }

      // Verifica o tamanho do arquivo
      const stats = fs.statSync(mp3Path);
      const fileSizeInMB = stats.size / (1024 * 1024);

      let transcriptionText = '';

      if (fileSizeInMB > 25) {
        // Divide o arquivo em segmentos de 15 minutos (900 segundos)
        console.log('Dividindo arquivo em segmentos menores...');
        const segments = await TranscriptionController.splitAudio(mp3Path, 900); // 900 segundos = 15 minutos

        for (const segment of segments) {
          console.log(`Transcrevendo segmento: ${segment}`);
          const segmentTranscription = await TranscriptionController.transcribeWithOpenAI(segment);
          transcriptionText += segmentTranscription + ' ';
          // Remove o segmento após transcrição
          fs.unlinkSync(segment);
        }
      } else {
        // Transcreve o arquivo diretamente
        transcriptionText = await TranscriptionController.transcribeWithOpenAI(mp3Path);
        console.log('texto transcrito: ' + transcriptionText)
      }

      // Remove os arquivos temporários (o original e o MP3)
      fs.unlinkSync(filePath);
      if (filePath !== mp3Path) {
        fs.unlinkSync(mp3Path);
      }

      // Adiciona uma nova etapa: Gera conteúdo com o GPT-4 a partir da transcrição
      const generatedContent = await TranscriptionController.generateTextFromTranscription(transcriptionText);
      console.log('Texto gerado pelo ChatGPT:', generatedContent);

      // Atualiza o status da transcrição no banco de dados como "concluído" e salva o texto transcrito
      transcription.status = 'completed';
      transcription.transcriptionText = generatedContent;
      await transcription.save();

      // Chama a função para criar tarefas a partir da transcrição
      const response = await TranscriptionController.createTasksFromTranscription(transcription.id);

      console.log('Transcrição concluída e salva no banco de dados.');

      return response
    } catch (error) {
      // Em caso de erro, registra a falha e atualiza o status da transcrição para "falha"
      console.error('Erro ao processar transcrição:', error);
      transcription.status = 'failed';
      await transcription.save();
    }
  }

  // Novo método para enviar a transcrição para o ChatGPT e gerar conteúdo
static async generateTextFromTranscription(transcriptionText) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `
            Você é um assistente especializado para técnicos de manutenção de chão de fábrica. 
            Sua função é gerar uma lista de tarefas (to-do list) clara e organizada a partir do seguinte texto transcrito. 
            Além disso, você deve indicar quais categorias de ferramentas e equipamentos o técnico precisará pegar no almoxarifado.
            Sua função é gerar uma **string JSON válida** com a seguinte estrutura:
            - "título": Um título breve e claro para a tarefa.
            - "local": O local onde a tarefa precisa ser realizada, se disponível no texto.
            - "descrição": Uma descrição detalhada que inclui uma lista de tarefas (to-do list) e qualquer outra informação relevante.
            - "categorias": Um array com as categorias de ferramentas e equipamentos necessários, baseado no seguinte catálogo:

            **Categorias de Ferramentas e Equipamentos:**
            1. Ferramentas de Corte: 
               Serra Circular, Disco de Corte, Serra de Fita, Disco de Desbaste, Broca de Aço Rápido 10mm, 
               Conjunto de Fresas para Usinagem, Lâmina de Serra Sabre, Lixadeira Angular

            2. Ferramentas de Medição: 
               Paquímetro Digital, Micrômetro, Relógio Comparador, Trena de Aço 5m, Nível de Bolha, 
               Goniômetro Digital, Manômetro para Pressão, Calibrador de Roscas

            3. Equipamentos de Solda: 
               Máquina de Solda MIG, Eletrodo de Solda Inox, Máscara de Solda Automática, Maçarico de Corte Oxiacetilênico, 
               Tocha de Solda TIG, Fio de Solda MIG ER70S-6, Regulador de Pressão para Gás, Tubo de Gás Acetileno

            4. Lubrificação e Manutenção: 
               Graxa Industrial, Óleo Lubrificante 10W30, Bomba de Graxa Pneumática, Limpa Contatos Elétricos, 
               Spray Desengripante, Veda Rosca em Fita

            5. Equipamentos de Segurança: 
               Capacete de Segurança com Aba, Luvas Térmicas de Alta Resistência, Óculos de Proteção Antirrespingos, 
               Protetor Auricular Tipo Plug, Máscara Respiratória com Filtro P3, Cinto de Segurança para Trabalho em Altura, 
               Sapato de Segurança com Biqueira de Aço, Protetor Facial de Policarbonato

            6. Equipamentos de Elevação: 
               Talha Elétrica de Corrente, Corrente de Elevação de 10m, Gancho Giratório com Trava de Segurança, 
               Cinta de Elevação com Olhal, Carrinho de Transporte de Bobinas, Macaco Hidráulico 10 Toneladas

            7. Componentes Mecânicos: 
               Rolamento Esférico de Precisão, Parafuso de Alta Resistência M12, Correia de Transmissão Industrial, 
               Junta de Vedação em Borracha, Engrenagem Cilíndrica de Aço, Bucha de Bronze Autolubrificante, 
               Eixo de Transmissão, Polia de Alumínio

            8. Equipamentos Hidráulicos: 
               Válvula Solenoide Hidráulica, Bomba Hidráulica de Pistão, Mangueira Hidráulica de Alta Pressão, 
               Conector Hidráulico Rápido

            9. Equipamentos Elétricos: 
               Motor Elétrico Trifásico 5HP, Cabo Elétrico 10mm², Disjuntor de 100A, Quadro de Comando Elétrico 
               com Inversor de Frequência, Chave Seccionadora, Fusível NH 100A, Tomada Industrial 380V

            10. Ferramentas Manuais: 
               Chave de Fenda Phillips 6mm, Alicate de Corte, Martelo de Borracha, Torquímetro 40-200Nm, 
               Conjunto de Chaves Allen, Chave Estrela 12mm, Serra Manual

            A saída **deve ser uma única string JSON**. Não inclua quebras de linha ou indentação na resposta. Certifique-se de que a string JSON esteja no formato correto para ser parseada diretamente pelo JavaScript.
            Exemplo da estrutura da string JSON esperada:
            [{"título":"Lubrificação dos Rolamentos da Linha 3","local":"Linha 3","descrição":"Realizar a lubrificação dos rolamentos da máquina na linha 3 usando o lubrificante código azul 6624.","categorias":["Lubrificação", "Manutenção"]}]
            `,
        },
        { role: 'user', content: transcriptionText },
      ],
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Erro ao gerar texto com GPT-4o:', error);
    throw error;
  }
}

static async createTasksFromTranscription(transcriptionId) {
  try {
    // 1. Recupera a transcrição pelo ID
    const transcription = await Transcription.findByPk(transcriptionId, {raw: true});

    if (!transcription) {
      console.error('Transcrição não encontrada.');
      return;
    }

    // 2. Extrai o JSON do campo transcriptionText
    const tarefas  = JSON.parse(transcription.transcriptionText);

    // 3. Itera sobre cada tarefa no JSON
    for (const tarefa of tarefas) {
      const { título, local, descrição } = tarefa;
      const categorias = tarefa.categorias;

      // 4. Cria a tarefa no banco de dados
      const task = await Task.create({
        title: título,
        local: local,
        description: descrição,
        status: 'A FAZER',
      });

      // 5. Associa as categorias à tarefa
      for (const categoryName of categorias) {
        const [category] = await ToolCategory.findOrCreate({ where: { name: categoryName } });
        await task.addToolCategory(category);
      }

      console.log(`Tarefa "${título}" criada com sucesso.`);
    }

    console.log('Todas as tarefas foram criadas com sucesso.');
    return Task.findAll()
  } catch (error) {
    console.error('Erro ao criar tarefas a partir da transcrição:', error);
  }
}

  // Método para converter o arquivo para MP3 usando o ffmpeg
  static convertToMp3(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3') //Converte para MP3
        .on('error', (err) => {
          console.error('Erro ao converter para MP3:', err); // Registra erro na conversão
          reject(err); // Rejeita a promessa em caso de erro
        })
        .on('end', () => {
          console.log('Conversão para MP3 concluída');
          resolve(); // Resolve a promessa quando a conversão é concluída
        })
        .save(outputPath); // Salva o arquivo convertido no caminho de saída
    });
  }

  // Método para chamar a API da OpenAI para transcrever o arquivo de áudio
  static async transcribeWithOpenAI(filePath) {
    try {
      // Faz a requisição para a API da OpenAI, passando o arquivo MP3 e o modelo de transcrição
      const response = await openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath), // Envia o arquivo como um stream
        model: "whisper-1", // Usa o modelo de transcrição "whisper-1"
        response_format: "text", // Formato de resposta será texto
      });

      console.log(`Transcrição concluída para o arquivo: ${filePath}`);
      return response; // Retorna a resposta da API
    } catch (error) {
      console.error(`Erro na transcrição com OpenAI para o arquivo ${filePath}:`, error);
      throw error;
    }
  }
 
  // Método para obter todas as transcrições de um usuário
  static async getTranscriptions(req, res) {
    const userId = req.user.uid; // Obtém o ID do usuário a partir do token de autenticação

    try {
      // Busca todas as transcrições do usuário, ordenadas pela data de criação (mais recente primeiro)
      const transcriptions = await Transcription.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });
      res.status(200).json({ transcriptions }); // Retorna as transcrições encontradas
    } catch (error) {
      // Em caso de erro, aparece o erro e retorna uma resposta de erro 500
      console.error('Erro ao obter transcrições:', error);
      res.status(500).json({ error: 'Erro ao obter transcrições' });
    }
  }

  // Método para baixar uma transcrição concluída
  static async downloadTranscription(req, res) {
    const { id } = req.params; // Obtém o ID da transcrição dos parâmetros da URL
    const userId = req.user.uid; // Obtém o ID da transcrição dos parâmetros da URL

    try {
      // Busca a transcrição pelo ID e pelo ID do usuário
      const transcription = await Transcription.findOne({
        where: { id, userId }, 
      });

      // Se a transcrição não for encontrada, retorna um erro 404
      if (!transcription) {
        return res.status(404).json({ error: 'Transcrição não encontrada' });
      }

      // Se a transcrição ainda não estiver concluída, retorna um erro 400
      if (transcription.status !== 'completed') {
        return res.status(400).json({ error: 'Transcrição ainda não está pronta' });
      }

      // Configura os headers para permitir o download do arquivo como texto
      res.setHeader('Content-Disposition', `attachment; filename=transcription_${id}.txt`);
      res.setHeader('Content-Type', 'text/plain');
      res.send(transcription.transcriptionText); // Envia o texto da transcrição para o cliente
    } catch (error) {
      // Em caso de erro, loga o erro e retorna uma resposta de erro 500
      console.error('Erro ao baixar transcrição:', error);
      res.status(500).json({ error: 'Erro ao baixar transcrição' });
    }
  }

  /*
   Divide o arquivo de áudio em segmentos de 10 minutos.
    @param {string} inputPath - Caminho do arquivo de entrada.
    @param {number} segmentDuration - Duração de cada segmento em segundos.
    @returns {Promise<string[]>} - Array com os caminhos dos segmentos criados.
  */
  static splitAudio(inputPath, segmentDuration = 900) { // 900 segundos = 15 minutos
    return new Promise((resolve, reject) => {
      // Usa ffprobe para obter metadados do arquivo, incluindo a duração total do áudio
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          return reject(err);
        }

        const duration = metadata.format.duration; // Obtém a duração total do áudio
        const numberOfSegments = Math.ceil(duration / segmentDuration); // Calcula o número total de segmentos
        const segmentPaths = []; // Array para armazenar os caminhos dos segmentos gerados

        const splitPromises = []; // Array para armazenar as promessas de divisão de cada segmento

        // Loop para gerar cada segmento
        for (let i = 0; i < numberOfSegments; i++) {
          const startTime = i * segmentDuration; // Define o tempo de início para o segmento atual
          const outputPath = `${path.parse(inputPath).name}_part${i + 1}.mp3`; // Caminho do arquivo de saída para o segmento
          segmentPaths.push(outputPath); // Armazena o caminho do segmento no array

          // Cria uma nova promessa para dividir o segmento
          splitPromises.push(new Promise((res, rej) => {
            ffmpeg(inputPath)
              .setStartTime(startTime) // Define o tempo de início do segmento
              .setDuration(segmentDuration)  // Define a duração do segmento
              .output(outputPath) // Define o caminho do arquivo de saída
              .on('end', () => { // Quando a divisão do segmento terminar
                console.log(`Segmento ${i + 1} criado: ${outputPath}`);
                res(); // Resolve a promessa para o segmento
              })
              .on('error', (error) => {
                console.error(`Erro ao criar segmento ${i + 1}:`, error);
                rej(error); // Rejeita a promessa com o erro
              })
              .run(); // Inicia o processo de divisão usando ffmpeg
          }));
        }

        // Executa todas as promessas de divisão ao mesmo tempo e resolve a promessa principal com os caminhos dos segmentos
        Promise.all(splitPromises)
          .then(() => resolve(segmentPaths)) // Resolve a promessa com os caminhos dos arquivos segmentados
          .catch((error) => reject(error)); // Em caso de erro, rejeita a promessa principal
      });
    });
  }

  // Método para obter o limite diário restante do usuário
  static async getDailyLimit(req, res) {
    const userId = req.user.uid; // Obtém o ID do usuário a partir do token de autenticação

    // Define o limite diário
    const DAILY_LIMIT = 5;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      // Conta quantas transcrições o usuário já criou hoje
      const count = await Transcription.count({
        where: {
          userId,
          createdAt: {
            [Op.gte]: today,
          },
        },
      });

      const remaining = DAILY_LIMIT - count;

      res.status(200).json({ remainingTranscriptions: remaining >= 0 ? remaining : 0 });
    } catch (error) {
      console.error('Erro ao obter limite diário:', error);
      res.status(500).json({ error: 'Erro ao obter limite diário' });
    }
  }


}

// Exporta a classe TranscriptionController para ser usada em outros lugares da aplicação
module.exports = TranscriptionController;