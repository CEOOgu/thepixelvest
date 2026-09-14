import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { nodes } = await req.json();

    // 1. Locate the master database you generated
    const filePath = path.join(process.cwd(), 'app', 'master-board.json');
    
    
    // 2. Read the file
    const fileData = fs.readFileSync(filePath, 'utf8');
    const database = JSON.parse(fileData);

    // 3. Find exactly what is hiding behind the selected nodes
    const results = nodes.map((id: number) => {
      // Arrays start at 0, so Node ID 1 is at index 0
      return database[id - 1]; 
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: "Failed to read database" }, { status: 500 });
  }
}