'use client';

import styles from "./page.module.css";
import Header from "../../../components/Header/header";
import Card from "../../../components/Card/card";
import Button from "../../../components/Button/button";
import Modal from "../../../components/ModalAddTask/modal";
import { BsPlusCircleFill } from "react-icons/bs";
import { FaFilePdf } from "react-icons/fa";
import { useState } from "react";

export default function Home() {

    function DownloadAsPDF() { 
        console.log("Funcionou")
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
