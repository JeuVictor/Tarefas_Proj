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
    addDoc,
    getDocs
} from "firebase/firestore";
import { Textarea } from "@/components/textarea";
import { FaTrash, FaExclamationTriangle} from "react-icons/fa";

interface taskProps{
    item:{
        tarefa: string,
        created: string,
        public: boolean,
        user: string,
        taskId: string,
    }
    allComments: commentsProps[]
}

interface commentsProps{
    id: string;
    comment: string;
    name: string;
    taskId: string;
    user: string;
}

export default function Task({item, allComments}: taskProps){

    const {data: session} = useSession();
    const [input, setInput] = useState("");
    const [comments, setComments] = useState<commentsProps[]>(allComments||[])
    

    async function handleComments(event: FormEvent) {
        event.preventDefault();
        
        if(input === "" || !session?.user?.email || !session?.user?.name) return;

        try{
            const docRef = await addDoc(collection(bd, "comments"),{
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId,
                taskUser: item?.user,
            });

            const data ={
                id: docRef.id,
                comment: input,
                user: session?.user?.email,
                name: session?.user?.name,
                taskId: item?.taskId
            };

            setComments((old)=>[...old, data])
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
            <section className={styles.commentsContainer}>
                <h2>Todos os comentários</h2>
                {comments.length === 0 &&( 
                    <span> Nenhum comentário foi encontrado...</span>
                )}

                {comments.map((i)=>(
                    <article key={i.id} className={styles.comment}>
                        <div className={styles.headComment}>
                            <label className={styles.commentsLabel}> {i.name} </label>
                            <div className={styles.icons}>

                                {i.user === session?.user?.email && (
                                    <button className={styles.trash}> 
                                        <FaTrash title="Excluir" color="#ea3140" fontSize={18}/>
                                    </button>
                                )
                                }
                                <button className={styles.trash} title="Denunciar"> 
                                        <FaExclamationTriangle color="#ea2" fontSize={18}/>
                                    </button>
                            </div>
                            
                        </div>
                        <p>{i.comment}</p>
                    </article>
                ))}
            </section>     
        </div>
    )
}

export const getServerSideProps: GetServerSideProps = async ({params}) =>{
    const id = params?.id as string;

    const docRef = doc(bd, "tarefas", id)
    const q = query(collection(bd, "comments"), where("taskId", "==", id))
    const snapshotComments = await getDocs(q)

    let allComments : commentsProps[] = [];

    snapshotComments.forEach((doc)=>{
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId,
        })
    })

    console.log(allComments);

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
            allComments: allComments,
        }
    }
}
