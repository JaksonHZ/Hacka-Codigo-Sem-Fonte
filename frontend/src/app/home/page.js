'use client';

import styles from "./page.module.css";
import Header from "../../../components/Header/header";
import Card from "../../../components/Card/card";
import Button from "../../../components/Button/button";
import Modal from "../../../components/ModalAddTask/modal";
import { BsPlusCircleFill } from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa";
import { useState } from "react";
import API from "../../../axios/API";

export default function Home() {

    function DownloadAsPDF() {        
        const downloadPDF = async () => {
          try {
            const response = await API.get('/generate-pdf', {
              responseType: 'blob',
              withCredentials: true,
            });
      
            const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      
            const pdfURL = URL.createObjectURL(pdfBlob);
      
            const link = document.createElement('a');
            link.href = pdfURL;
            link.setAttribute('download', 'document.pdf');
            document.body.appendChild(link);
            link.click(); 
      
            document.body.removeChild(link);
            URL.revokeObjectURL(pdfURL);
      
          } catch (error) {
            console.error('PDF download failed:', error);
          }
        };
      
        // Chama a função de download ao inicializar
        downloadPDF();
      }

    const [isModalOpen, setModalOpen] = useState(false);

    function openModal() {
        setModalOpen(true);
    }

    function closeModal() {
        setModalOpen(false);
    }


  return (
    <div className={styles.page}>
    <Header />
      <main className={styles.main}>

        <div className={styles.cardList}>
            <h3>BACKLOG</h3>
            <Button 
                primary={true}
                icon={<BsPlusCircleFill color="#FFF" size={24}/>}
                text={"Adicionar Tarefa"}
                onClick={openModal}
            />
            <Card />
        </div>

        <div className={styles.verticalLine}/>

        <div className={styles.cardList}>
            <h3>A FAZER</h3>
                <Button 
                    primary={false}
                    icon={<FaFilePdf color="#003B7A" size={24}/>}
                    text={"Fazer Download"}
                    onClick={DownloadAsPDF}
                />
            <Card />
        </div>

        <div className={styles.verticalLine}/>

        <div className={styles.cardList}>
            <h3>EM PROGRESSO</h3>
            <Card />
        </div>

        <div className={styles.verticalLine}/>

        <div className={styles.cardList}>
            <h3>FEITO</h3>
            <Card />
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
