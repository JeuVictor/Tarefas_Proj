import { ChangeEvent, FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import styles from "./styles.module.css";
import { GetServerSideProps } from "next";
import { bd } from "../services/firebaseConnection"
import{
    doc,
    collection,
    query,
    where,
    getDoc,
    addDoc
} from "firebase/firestore";
import { Textarea } from "@/components/textarea";

interface taskProps{
    item:{
        tarefa: string,
        created: string,
        public: boolean,
        user: string,
        taskId: string,
    }
}

export default function Task({item}: taskProps){

    const {data: session} = useSession();
    const [input, setInput] = useState("");

    async function handleComments(event: FormEvent) {
        event.preventDefault();
        
        if(input === "" || !session?.user?.email || !session?.user?.name) return;

        try{
            const docRef = await addDoc(collection(bd, "commets"),{
                commet: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId,
            });

            setInput("");
        }catch(err){
            console.log(err);
        }

    }

    return(
        <div className={styles.container}>
            <Head>
                <title> Detalhes da tarefa</title>
            </Head>

            <main className={styles.main}>
                <h1>Tarefa</h1>
                <article className={styles.task}>
                    <p>{item.tarefa}</p>
                </article>
            </main>

            <section className={styles.commentsContainer}>
                <h2>Deixar comentário</h2>
                <form onSubmit={handleComments}>
                    <Textarea
                        value={input}
                        onChange={ (event: ChangeEvent<HTMLTextAreaElement>) =>
                             setInput(event.target.value)}
                        placeholder="Digite seu comentário..."/>
                    <button className={styles.button} disabled={!session?.user}>Enviar comentário</button>
                </form>
            </section>

        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({params}) =>{
    const id = params?.id as string;

    const docRef = doc(bd, "tarefas", id)
    const snapshot = await getDoc(docRef)

    if(snapshot.data() === undefined || !snapshot.data()?.public){
        return{
            redirect:{
                destination: "/",
                permanent: false,
            },
        };
    }

    const miliseconds = snapshot.data()?.created?.seconds * 1000;
    const task = {
        tarefa: snapshot.data()?.tarefas,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        user: snapshot.data()?.user,
        taskId: id,
    }

    return{
        props: {
            item: task,
        }
    }
}
