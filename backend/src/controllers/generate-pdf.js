const PDFDocument = require('pdfkit');
const fs = require('fs');
const Task = require('../models/Task'); 

class GeneratePDFController{
    static async generatePDF(req, res){
        try {
            const doc = new PDFDocument({ margin: 30 });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="lista_de_atividades.pdf"');
      
            doc.pipe(res);
            const dataAtual = new Date();
            console.log(dataAtual);
            const month = dataAtual.getMonth() + 1;
            const day = dataAtual.getDate();

            doc.fontSize(18).text(`Lista de atividades - ${day}/${month}`, { align: 'center' });
            doc.moveDown();
      
            const activities = await Task.findAll();

            activities.forEach((activity, index) => {
                doc.rect(30, doc.y, 15, 15).stroke();
                doc.moveUp().moveDown(0.5);
        
                //doc.fontSize(12).text(Título: ${activity.title}, 50, doc.y);
                doc.font('Helvetica-Bold')
                .fontSize(14)
                .text(`${activity.title}`, 50, doc.y);
    
                doc.moveDown(0.5);
                doc.font('Helvetica')
                .fontSize(14)
                .text(`${activity.description}`, 50, doc.y);
                doc.moveDown(0.5);
        
                doc.text('Ferramentas:', 50, doc.y);
                doc.moveDown();
                activity.tools.forEach(tool => {
                    doc.rect(50, doc.y, 10, 10).stroke(); 
                    doc.moveUp().moveDown(0.5);
                    
                    doc.text(`${tool}`, 70, doc.y);
            
                    doc.moveDown(0.5);
                });
        
                doc.moveDown();
  
                if (index < activities.length - 1) {
                  doc.moveDown(0.5);
                  doc.lineWidth(0.5).moveTo(30, doc.y).lineTo(570, doc.y).stroke();
                  doc.moveDown(1);
                }
              });
            doc.end();
      
            doc.on('finish', () => {
              res.download(filePath, 'lista_de_atividades.pdf', (err) => {
                if (err) {
                  console.error("Erro ao enviar o PDF:", err);
                  res.status(500).send("Erro ao enviar o PDF");
                } else {
                  fs.unlinkSync(filePath);
                }
              });
            });
          } catch (error) {
            console.error('Erro ao gerar o PDF:', error);
            res.status(500).json({ message: 'Erro ao gerar o PDF' });
          }
    }
}
module.exports = GeneratePDFController;
