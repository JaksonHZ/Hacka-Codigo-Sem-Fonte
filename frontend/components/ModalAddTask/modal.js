import styles from "./modal.module.css"
import { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { BsPlusCircleFill } from "react-icons/bs";
import Button from "../Button/button";

export default function Modal({ isOpen, onClose }) {
    if (!isOpen) return null;

    const [fileName, setFileName] = useState("");
    const [step, setStep] = useState(1)

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
            console.log(file);
        }
    };

    function submitFile(){
        setStep(0);

        setTimeout(() => {
            setStep(2);
        },4000)
    }

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
                                />
                            </div>

                            <div className={styles.containerFields}>
                                <h5>Local de ação</h5>

                                <input
                                    className={styles.input}
                                    type="text"
                                />
                            </div>

                            <div className={styles.containerFields}>
                                <h5>Descrição</h5>

                                <textarea 
                                    className={styles.textarea}
                                />
                            </div>

                            <div className={styles.containerFields}>
                                <div className="div-5">
                                <h5>Ferramentas</h5>

                                <p className="text-wrapper-3">
                                    Selecione as ferramentas que você irá utilizar
                                </p>
                                </div>
                            </div>

                            <Button
                                icon={<BsPlusCircleFill color="#FFF" size={24}/>}
                                text="SALVAR TAREFA"
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