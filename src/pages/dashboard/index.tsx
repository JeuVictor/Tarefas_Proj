import Head from 'next/head';
import styles from './styles.module.css';
import { GetServerSideProps } from 'next';
import {getSession} from 'next-auth/react';
import { Textarea } from '../../components/textarea';
import { FiShare2, FiShare, FiSend } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';

export default function Dashboard(){



    return(
        
        <div className={styles.container}>

            <Head>
                <title>Meu Painel de tarefas</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}> Qual a sua tarefa?</h1>
                        <form >
                            <Textarea
                                placeholder='Digite qual a sua tarefa...'/>
                            <div className={styles.checkboxArea}>
                                <input type="checkbox" className={styles.checkbox}/>
                                <label>Deixar tarefa publica?</label>
                            </div>
                            <button className={styles.button} type='submit'> Registrar </button>
                        </form>
                    </div>
                </section>

                <section className={styles.taskContainer}>
                    <h1>Minhas tarefas</h1>
                    <article className={styles.task}>
                        <div className={styles.tagContainer}>
                            <label className={styles.tag}>PUBLICO</label>
                            <button className={styles.shareButton}>
                                <FiShare2 size={22} color='#3183ff'/>
                            </button>
                        </div>
                        <div className={styles.taskContent}>
                            <p>Minha primeira tarefa de exemplo.</p>
                            <button className={styles.trash}>
                                <FaTrash size={24} color='#ea3140'/>
                            </button>
                        </div>
                    </article>

                </section>

                
            </main>        
        </div>

    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const session = await getSession({req});
    
    if(!session?.user){
        return {
                redirect:{
                    destination: '/',
                    permanent: false,
            },
        };
    }

    return{
        props: {},
    };
};

