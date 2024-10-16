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
    getDocs,
    deleteDoc
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
        denunciante: string,
        idComment: string,
    }
    allComments: commentsProps[]
    allDenuncias: commentsProps[]
}

interface commentsProps{
    id: string;
    comment: string;
    name: string;
    taskId: string;
    user: string;
    denunciante: string;
    idComment: string;
}

export default function Task({item, allComments, allDenuncias}: taskProps){

    const {data: session} = useSession();
    const [input, setInput] = useState("");
    const [comments, setComments] = useState<commentsProps[]>(allComments||[])
    const [denuncia, setDenuncia] = useState<commentsProps[]>(allDenuncias || [])

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

    async function handleDenunciaComentario(  denuncia : commentsProps) {
        try{
            const docRef = doc(bd, "comments", denuncia.id)

            if(session?.user?.email === item.user){
                handleDeleteComments(denuncia.id);
            }
            else{
                const comments = await addDoc(collection(bd, "denuncia"),{
                    comment: denuncia.comment,
                    user: denuncia.user,
                    name: denuncia.name,
                    taskId: denuncia.taskId,
                    denunciante: session?.user?.email,
                    idComment: denuncia.id,
                })
                return alert("denunciado")
            }

        }catch(err){
            console.log(err)
        }        
    }

    async function handleDeleteDenuncias(id:string, idComment?: string) {
        try {            
            const docRefDenuncia = doc(bd, "denuncia",id)
            await deleteDoc(docRefDenuncia);
            const deleteDenuncia = denuncia.filter((i)=> i.id !== id);
            
            if (idComment) {
                handleDeleteComments(idComment);
            }
            setDenuncia(deleteDenuncia);
            
        } catch (error) {
            console.log(error);
        }
    }
    async function handleDeleteComments(id:string) {
        try{               
                 
                const docRef = doc(bd, "comments", id)
                await deleteDoc(docRef);                
                const deleteComments = comments.filter((i)=> i.id !== id)
                
                setComments(deleteComments);

                denuncia.forEach((i)=>{
                    if(i.idComment === id){
                        console.log(i.id + " <- este é o ID")
                        handleDeleteDenuncias(i.id);
                    }
                })
            
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
                                    <button 
                                     className={styles.trash}
                                     title="Excluir" 
                                     onClick={ ()=> handleDeleteComments(i.id)}> 
                                        <FaTrash color="#ea3140" fontSize={18}/>
                                    </button>
                                )
                                }
                                <button className={styles.trash} title="Denunciar"
                                disabled ={!session?.user}
                                onClick={()=> handleDenunciaComentario(i)}> 
                                        <FaExclamationTriangle  fontSize={18}/>
                                    </button>
                            </div>
                            
                        </div>
                        <p>{i.comment}</p>
                    </article>
                ))}
            </section>
            {session?.user?.email === item.user &&(               
                <section className={styles.commentsContainer}>
                {denuncia.length > 1 &&(
                        <h1> Comentarios com Denuncia</h1>
                    )}
                {denuncia.map((i)=>(
                    <article key={i.id} className={styles.denunciaComments}>
                        <div className={styles.headComment}>
                            <label className={styles.commentsLabel}> {i.name}</label>
                            {item.user === session?.user?.email && (
                                        <button 
                                        className={styles.trash}
                                        title="Excluir" 
                                        onClick={ ()=> handleDeleteDenuncias(i.id, i.idComment = i.idComment )}> 
                                            <FaTrash color="#ea3140" fontSize={18}/>
                                        </button>
                                )
                            }
                        </div>
                        <p>{i.comment}</p>
                    </article>    
                ))}
                </section>     
            )}
        </div>
    )
} 
export const getServerSideProps: GetServerSideProps = async ({params}) =>{
    const id = params?.id as string;

    const docRef = doc(bd, "tarefas", id)
    const q = query(collection(bd, "comments"), where("taskId", "==", id))
    const snapshotComments = await getDocs(q)

    const denuncia = query(collection(bd, "denuncia"), where("taskId", "==", id))
    
    const snapDenuncia = await getDocs(denuncia)
    
    let allComments : commentsProps[] = [];
    let allDenuncias : commentsProps[] = [];

    snapDenuncia.forEach((doc)=>{
        allDenuncias.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId,
            denunciante: doc.data().denunciante,
            idComment: doc.data().idComment,

        })
    })

    snapshotComments.forEach((doc)=>{
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            user: doc.data().user,
            name: doc.data().name,
            taskId: doc.data().taskId,
            denunciante: "",
            idComment: doc.id,
        })
    })

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
            allDenuncias: allDenuncias,
        }
    }
}
