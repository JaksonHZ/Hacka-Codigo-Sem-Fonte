import styles from "./modal.module.css"
import { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { BsPlusCircleFill } from "react-icons/bs";
import Button from "../Button/button";
import API from "../../axios/API";

export default function Modal({ isOpen, onClose }) {
    if (!isOpen) return null;
    const [file, setFile] = useState(null);
    const [step, setStep] = useState(1);
    const [task, setTask] = useState();

    const handleFileChange = (event) => {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
      }
    };
  
    const submitFile = async () => {
        setStep(0);
      
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
      
          try {
            const response = await API.post('/api/transcriptions', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              withCredentials: true,
            });
      
            console.log('Upload successful:', response.data);
            setTask(response.data[0])
            setStep(2);
          } catch (error) {
            console.error('Upload failed:', error);
            setStep(1);
          }
        }
      };
      

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.close} onClick={onClose}>
                    <IoIosClose size={32}/>
                </div>
                { step === 1 &&
                    <>                    
                        <h2>Adicionar Tarefa</h2>
                        <p>Formulário para adicionar uma nova tarefa.</p>

                        <input
                            type="file"
                            id="fileInput"
                            onChange={handleFileChange}
                            className={styles.hiddenFileInput}
                        />

                        <Button 
                            primary={true}
                            icon={<BsPlusCircleFill color="#FFF" size={24}/>}
                            text={"Gerar Tarefa"}
                            onClick={submitFile}
                        />
                    </>
                }
                {
                    step === 2 && 
                    <>
                        <div className={styles.frame}>
                            <div className={styles.containerFields}>          
                                <h1>Tarefa gerada!</h1>

                                <p className="p">
                                Geramos a sua tarefa a partir do áudio que você nos forneceu, apenas
                                confira e ajuste qualquer detalhe que precisar. Mãos a obra!
                                </p>
                            </div>

                            <div className={styles.containerFields}>
                                <h5>Título</h5>

                                <input
                                    className={styles.input} 
                                    type="text"
                                    value={task.title}
                                />
                            </div>

                            <div className={styles.containerFields}>
                                <h5>Local de ação</h5>

                                <input
                                    className={styles.input}
                                    type="text"
                                    value={task.local}
                                />
                            </div>

                            <div className={styles.containerFields}>
                                <h5>Descrição</h5>

                                <textarea 
                                    className={styles.textarea}
                                    value={task.description}
                                />
                            </div>

                            <div className={styles.containerFields}>
                                <div className="div-5">
                                    <h5>Ferramentas</h5>

                                    <p className="text-wrapper-3">
                                        Selecione as ferramentas que você irá utilizar
                                    </p>

                                    <div className={styles.containerCheckbox}>
                                        <label>
                                            <input
                                                type="checkbox"
                                            />
                                            Serra Circular [MAT001]
                                        </label>

                                        <label>
                                            <input
                                                type="checkbox"
                                            />
                                            Alicate de Corte [MAT902]
                                        </label>

                                        <label>
                                            <input
                                                type="checkbox"
                                            />
                                            Serra Manual [MAT907]
                                        </label>

                                        <label>
                                            <input
                                                type="checkbox"
                                            />
                                            Torquímetro 40-200Nm [MAT904]
                                        </label>

                                        <label>
                                            <input
                                                type="checkbox"
                                            />
                                            Conjunto de Chaves Allen [MAT905]
                                        </label>

                                        <label>
                                            <input
                                                type="checkbox"
                                            />
                                            Disco de Corte [MAT002]
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <Button
                                icon={<BsPlusCircleFill color="#FFF" size={24}/>}
                                text="SALVAR TAREFA"
                                onClick={onClose}
                            />
                        </div>
                    </>
                }

                {
                    step === 0 &&
                    <div className={styles.loader}></div> 
                }

            </div>
        </div>
    );
}