'use client';   

import styles from "./card.module.css";
import { useState, useEffect } from "react";
import { BsGeoAltFill } from "react-icons/bs";

const dados = {
    "categoria": "Inspeção de temperatura",
    "nome": "Peneira Poligonal",
    "descricao": "Verificação se a temperatura está muito elevada",
    "listaCategorias": [
        {
            "categoria": "Corte"
        },
        {
            "categoria": "Medicao"
        }
    ]
}

export default function Card() {

    const [categoria, setCategorias] = useState(dados.listaCategorias);

  return (
    <div className={styles.containerCard}>
        <strong>{dados.categoria}</strong>
        <div className={styles.loc}>
            <BsGeoAltFill />
            <span>{dados.nome}</span>
        </div>
        <p>{dados.descricao}</p>

        <div className={styles.ListaCategorias}>
            {
                categoria.map((item, key) => {
                    return (
                        <div key={key} className={styles.cardCategoria}>
                            <span>{item.categoria}</span>
                        </div>
                    )
                })
            }
        </div>
    </div>
  );
}
