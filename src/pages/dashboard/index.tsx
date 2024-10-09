import Head from 'next/head';
import styles from './styles.module.css';
import { ChangeEvent, FormEvent, useState } from 'react';

import { GetServerSideProps } from 'next';
import {getSession} from 'next-auth/react';
import { Textarea } from '../../components/textarea';
import { FiShare2} from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import { bd } from '../services/firebaseConnection';
import { addDoc, collection } from 'firebase/firestore';

interface HomeProps{
    user: {
        email: string;
    }
}

export default function Dashboard({ user }: HomeProps){
    const [input, setInput] = useState("");
    const [publicTask, setPublicTask] = useState(false);

    function handleChangePublic (event: ChangeEvent<HTMLInputElement>){
        console.log(event.target.checked);
        setPublicTask(event.target.checked)
    }

    async function handlerRegisterTask(event: FormEvent){
        event.preventDefault();

        if (input ==="") return;

        try{
            await addDoc(collection(bd, "tarefas"),{
                tarefas: input,
                created: new Date(),
                user: user?.email,
                public: publicTask,
            });

            setInput("")
            setPublicTask(false);
            
        }catch(err){
            console.log(err)
        }
    }

    return(
        
        <div className={styles.container}>

            <Head>
                <title>Meu Painel de tarefas</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}> Qual a sua tarefa?</h1>
                        <form onSubmit={handlerRegisterTask}>
                            <Textarea
                                placeholder='Digite qual a sua tarefa...'
                                value={input}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>{
                                    setInput(event.target.value)
                                }}/>
                            <div className={styles.checkboxArea}>
                                <input
                                  type="checkbox"
                                  className={styles.checkbox}
                                  checked ={publicTask}
                                  onChange={handleChangePublic}
                                  />
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
        props: {
            user: {
                email: session?.user?.email,
            }
        },
    };
};

