import styles from "./page.module.css";
import Link from 'next/link'

export default function Login() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.containerLogin}>
          <h1 className={styles.logo}>LOGO</h1>

          <div className={styles.containerInput}>
            <input className={styles.input} type="text" placeholder="E-mail" />
            <input className={styles.input} type="password" placeholder="Senha"/>
          </div>

          <div className={styles.containerButtons}>
            <Link href="/" className={styles.button}>LOGIN</Link>
            <span>ou</span>
            <Link href="/" className={styles.button}>CADASTRE-SE</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
