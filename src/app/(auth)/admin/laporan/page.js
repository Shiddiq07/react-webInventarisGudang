'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Card from '../../../../components/card';
import ConfigDialog from '../../../../components/ConfirmDialog';

export default function AdminKategoriForm() {
    const router = useRouter();
    const [modal, setModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [isOkOnly, setIsOkOnly] = useState(true);

    const [data, setData] = useState({
        namaKategori: '',
        kodeBarang: '',
        jumlah: '',
        date: '',
        keterangan: '',
        created_at: new Date(),
    });

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [textTahun, setTextTahun] = useState('');

    const months = [
        { value: '', label: 'Pilih Bulan' },
        { value: '01', label: 'Januari' },
        { value: '02', label: 'Februari' },
        { value: '03', label: 'Maret' },
        { value: '04', label: 'April' },
        { value: '05', label: 'Mei' },
        { value: '06', label: 'Juni' },
        { value: '07', label: 'Juli' },
        { value: '08', label: 'Agustus' },
        { value: '09', label: 'September' },
        { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' },
        { value: '12', label: 'Desember' },
        { value: 'all', label: 'Setahun' },
    ];

    // const clearData = () => {
    //     setData({
    //         namaKategori: '',
    //         kodeBarang: '',
    //         jumlah: '',
    //         date: '',
    //         keterangan: '',
    //     });
    // };

    const inputHandler = (e) => {
        if (e.target.id === 'date') {
            setSelectedDate(e.target.value);
        } else if (e.target.id === 'month') {
            setSelectedMonth(e.target.value);
        } else if (e.target.id === 'tahun') {
            setTextTahun(e.target.value);
        } else {
            setData({ ...data, [e.target.name]: e.target.value });
        }
    };

    const onCancel = () => {
        setModal(false);
        setModalTitle('');
        setModalMessage('');
        clearData();
    };

    const onOkOnly = () => {
        setModal(false);
        router.push('/admin/inventori');
    };

    const onConfirmOk = () => {
        // Implement your confirm logic here if needed
        setModal(false);
    };

    const sendDataToOtherPage = () => {
        const queryParams = new URLSearchParams();
        queryParams.append('tanggal', selectedDate);
        queryParams.append('bulan', selectedMonth);
        queryParams.append('tahun', textTahun);

        router.push(`/admin/laporan/toPdf?${queryParams.toString()}`);
    };

    async function onSubmitData() {
        try {
            const body = data;

            let res = await fetch('/api/inventaris', {
                method: 'POST',
                body: JSON.stringify(body),
            });

            let resData = await res.json();
            if (!resData.data) {
                throw Error(resData.message);
            }
            setModal(true);
            setModalTitle('Info');
            setModalMessage(resData.message);
        } catch (err) {
            console.error('ERR', err.message);
            setModal(true);
            setModalTitle('Err');
            setModalMessage(err.message);
        }
    }

    return (
        <>
            <Card title="Form Buat Laporan">
                <div className="w-full my-2">
                    <label htmlFor="date">Tanggal Pembuatan Laporan:</label>
                    <input
                        type="date"
                        id="date"
                        value={selectedDate}
                        onChange={inputHandler}
                        className="w-full border my-input-text"
                    />
                </div>

                <div className="w-full my-2">
                    <label htmlFor="month">Masukkan Bulan Data Yang Ingin diakses:</label>
                    <select id="month" value={selectedMonth} onChange={inputHandler} className="w-full border my-input-text">
                        {months.map((month) => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="w-full my-2">
                    <label htmlFor="text">Masukkan Tahun Data Yang Ingin diakses:</label>
                    <input
                        type="text"
                        id="tahun"
                        value={textTahun}
                        onChange={inputHandler}
                        className="w-full border my-input-text"
                    />
                </div>
                {/* <button className="btn-primary mr-2" onClick={onSubmitData}>
                    <span className="relative text-sm font-semibold text-white">
                        Save Data
                    </span>
                </button> */}
                <button className="btn-danger" onClick={sendDataToOtherPage}>
                    <span className="relative bg-blue-600 text-sm font-semibold text-black">
                        Buat Laporan
                    </span>
                </button>
            </Card>

            <ConfigDialog
                onOkOny={() => onOkOnly()}
                showDialog={modal}
                title={modalTitle}
                message={modalMessage}
                onCancel={() => onCancel()}
                onOk={() => onConfirmOk()}
                isOkOnly={isOkOnly}
            />
        </>
    );
}