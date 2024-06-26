import { connection } from "./firebase.js";
import fs from "node:fs";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FirestoreCollection } from "./util/constants.js";
import { hash } from "./util/authentication.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const checkData = async (collectionName: string, jsonFilePath: string) => {
  const collectionRef = connection.collection(collectionName);
  const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, "utf-8"));

  for (const doc of jsonData) {
    const docRef = collectionRef.doc(doc.id);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      if (collectionName === FirestoreCollection.USERS) {
        doc.password = await hash(doc.password);
      }
      await docRef.set(doc);
      console.log(`Document ${doc.id} added to collection`);
    } else {
      console.log(`Document ${doc.id} already exists in collection`);
    }
  }
};

export const initDatabase = async () => {
  try {
    await checkData(
      FirestoreCollection.USERS,
      path.join(__dirname, "data/users.json"),
    );
    await checkData(
      FirestoreCollection.ASSIGNMENTS,
      path.join(__dirname, "data/assignments.json"),
    );
    await checkData(
      FirestoreCollection.COURSES,
      path.join(__dirname, "data/courses.json"),
    );
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
