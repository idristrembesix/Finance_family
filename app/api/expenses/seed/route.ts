    import { prisma } from "@/app/prisma";
import { NextResponse } from "next/server";

    export async function GET() {
    try {
        // Menyuntikkan data awal keluarga ke database
        const newUsers = await prisma.user.createMany({
        data: [
            { name: "Abi", pin: "1111" },
            { name: "Umi", pin: "2222" },
            { name: "Idris", pin: "3333" },
            { name: "Hanifah", pin: "4444" },
        ],
        skipDuplicates: true, // Mencegah error jika data ditarik/refresh dua kali
        });

        // Menarik kembali data untuk memastikan data benar-benar masuk
        const allUsers = await prisma.user.findMany();

        return NextResponse.json({
        message: "Data keluarga berhasil dimasukkan ke database!",
        total_inserted: newUsers.count,
        users: allUsers
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Gagal menyuntikkan data" }, { status: 500 });
    }
    }