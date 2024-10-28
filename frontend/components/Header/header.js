import styles from "./header.module.css";
import { IoPersonSharp } from "react-icons/io5";

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>LOGO</h1>
      <nav>
        <ul>
          <li>
            <IoPersonSharp size={24}/>          
          </li>
          <li>
            José
          </li>
        </ul>
      </nav>
    </header>
  );
}
