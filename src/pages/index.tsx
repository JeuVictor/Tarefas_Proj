import { GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import time_logo from '../../public/assents/time_Logo.jpg'
import styles from "../styles/Home.module.css";
import { collection, getDoc, getDocs } from "firebase/firestore";
import { bd } from "./services/firebaseConnection";
import { FaBell } from "react-icons/fa";

interface HomeProps{
  posts: number;
  comments: number; 
  denuncia: number
}

export default function Home({posts, comments, denuncia}: HomeProps) {
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
          </div>

          <h1 className={styles.title}
          >Sistema feito para otimizar o seu tempo! <br /> Focando nos estudos e tarefas. </h1>
        
          <div>
            <div className={styles.infoContent}>
              <section className={styles.box}>
                <span>+{posts} Posts</span>
              </section>
              <span className={styles.boxDenuncia}  title = "Denuncias" >
                  <FaBell size={25}/> 
                  {denuncia > 0 &&(
                    <span className={styles.denuncias}>{denuncia}</span> 
                  )}
              </span>
          
              <section className={styles.box}>
                <span>+{comments} Comentarios</span>
              </section>
            </div>
          </div>
        </main>
      
      
      
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ()=>{
  const commentRef = collection(bd, "comments")
  const postRef = collection(bd, "tarefas") 
  const denunciaRef = collection(bd, "denuncia")

  const commentSnapshot = await getDocs(commentRef)
  const postSnapshot = await getDocs(postRef)
  const denunciaSnapshot = await getDocs(denunciaRef)

  
  return{
    props:{
      posts: postSnapshot.size || 0,
      comments: commentSnapshot.size || 0,
      denuncia: denunciaSnapshot.size || 0,
    },
    revalidate: 10
    
  }
} 