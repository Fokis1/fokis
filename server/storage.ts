import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, increment, getDoc } from "firebase/firestore";
import { db } from "./firebase.config"; // Inpòte Firestore
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class FirestoreStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // === USER OPERATIONS ===
  async getUser(id: string): Promise<User | undefined> {
    const userRef = doc(db, "users", id);
    const userSnapshot = await getDoc(userRef);
    return userSnapshot.exists() ? ({ id: userSnapshot.id, ...userSnapshot.data() } as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as User[];
    return users[0] || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const now = new Date();
    const userData = { ...insertUser, createdAt: now };
    const docRef = await addDoc(collection(db, "users"), userData);
    return { id: docRef.id, ...userData }; // Retounen objè ak ID Firestore
  }

  // === ARTICLE OPERATIONS ===
  async getAllArticles(language?: string, category?: string): Promise<Article[]> {
    let q = query(collection(db, "articles"), orderBy("publishedAt", "desc"));
    if (language) q = query(q, where("language", "==", language));
    if (category) q = query(q, where("category", "==", category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Article[];
  }

  async getArticleById(id: string): Promise<Article | undefined> {
    const articleRef = doc(db, "articles", id);
    const articleSnapshot = await getDoc(articleRef);
    return articleSnapshot.exists() ? ({ id: articleSnapshot.id, ...articleSnapshot.data() } as Article) : undefined;
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const now = new Date();
    const articleData = { ...insertArticle, publishedAt: now, viewCount: 0, commentCount: 0 };
    const docRef = await addDoc(collection(db, "articles"), articleData);
    return { id: docRef.id, ...articleData };
  }

  async incrementArticleViews(id: string): Promise<void> {
    const articleRef = doc(db, "articles", id);
    await updateDoc(articleRef, { viewCount: increment(1) });
  }

  // === POLL OPERATIONS ===
  async votePoll(id: string, option: string): Promise<Poll | undefined> {
    const pollRef = doc(db, "polls", id);
    const pollSnapshot = await getDoc(pollRef);
    if (!pollSnapshot.exists()) return undefined;

    const poll = pollSnapshot.data() as Poll;
    if (!poll.options.includes(option)) return undefined;

    const updatedResults = { ...poll.results };
    updatedResults[option] = (updatedResults[option] || 0) + 1;

    await updateDoc(pollRef, { results: updatedResults });
    return { id: pollSnapshot.id, ...poll, results: updatedResults };
  }

  // === VIDEO OPERATIONS ===
  async getAllVideos(language: string): Promise<Video[]> {
    const q = query(collection(db, "videos"), where("language", "==", language), orderBy("publishedAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Video[];
  }

  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const now = new Date();
    const videoData = { ...insertVideo, publishedAt: now };
    const docRef = await addDoc(collection(db, "videos"), videoData);
    return { id: docRef.id, ...videoData };
  }

  // === CATEGORY OPERATIONS ===
  async getPopularCategories(language: string): Promise<Record<string, number>> {
    const q = query(collection(db, "articles"), where("language", "==", language));
    const querySnapshot = await getDocs(q);
    const articles = querySnapshot.docs.map((doc) => doc.data() as Article);

    const categoryCounts: Record<string, number> = {};
    articles.forEach((article) => {
      categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
    });

    return categoryCounts;
  }
}

// Ekspòtasyon pou itilize klas la
export const storage = new FirestoreStorage();