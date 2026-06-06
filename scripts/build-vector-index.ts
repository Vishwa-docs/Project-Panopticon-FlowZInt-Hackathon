import { writeVectorIndex } from "@/lib/vector";

const index = writeVectorIndex();
console.log(`Indexed ${index.documents.length} knowledge-base documents into data/vector-index.json`);
