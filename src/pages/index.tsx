import Head from "next/head";
import Image from "next/image";
import time_logo from '../../public/assents/time_Logo.jpg'
import styles from "../styles/Home.module.css";


export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tarefas - Organize seu dia</title>
      </Head>  
        <main className={styles.main}>
          <div className={styles.logoContent}>
            <Image className={styles.hero}
            alt="Logo Tarefas"
            src={time_logo}
            priority/>
          <h1 className={styles.title}
          >Sistema feito para otimizar o seu tempo! <br /> Focando nos estudos e tarefas. </h1>

          </div>
        </main>
      
      
      
    </div>
  );
}
