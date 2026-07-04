    import { NextResponse } from 'next/server';
    import { GoogleSpreadsheet } from 'google-spreadsheet';
    import { JWT } from 'google-auth-library';

    export const dynamic = 'force-dynamic'; 

    async function getGoogleSheet() {
    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID!, serviceAccountAuth);
    await doc.loadInfo();
    return doc.sheetsByIndex[0];
    }

    export async function POST(req: Request) {
    try {
        const body = await req.json();
        const sheet = await getGoogleSheet();
        
        await sheet.addRow({
        'Tanggal': body.tanggal,
        'Pembayar': body.pembayar,
        'Nama Barang/Pengeluaran': body.namaBarang,
        'Kategori': body.kategori,
        'Harga': Number(body.harga),
        'Metode Pembayaran': body.metodePembayaran,
        'Tipe': body.tipe // Menyimpan 'Pemasukan' atau 'Pengeluaran'
        });

        return NextResponse.json({ message: 'Data berhasil dicatat!' }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    }

    export async function GET() {
    try {
        const sheet = await getGoogleSheet();
        const rows = await sheet.getRows();
        
        const data = rows.map(row => ({
        tanggal: row.get('Tanggal'),
        pembayar: row.get('Pembayar'),
        namaBarang: row.get('Nama Barang/Pengeluaran'),
        kategori: row.get('Kategori'),
        harga: row.get('Harga'),
        metode: row.get('Metode Pembayaran'),
        tipe: row.get('Tipe') || 'Pengeluaran', // Default ke pengeluaran jika data lama kosong
        })).reverse();

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    }

    export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { tanggal, namaBarang, harga, tipe } = body;
        const sheet = await getGoogleSheet();
        const rows = await sheet.getRows();

        const rowToDelete = rows.find(row => 
        row.get('Tanggal') === tanggal && 
        row.get('Nama Barang/Pengeluaran') === namaBarang && 
        String(row.get('Harga')).replace(/[^0-9]/g, '') === String(harga).replace(/[^0-9]/g, '') &&
        (row.get('Tipe') || 'Pengeluaran') === tipe
        );

        if (rowToDelete) {
        await rowToDelete.delete();
        return NextResponse.json({ message: 'Data dihapus!' }, { status: 200 });
        }

        return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    }