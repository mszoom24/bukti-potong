import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function UploadBuktiPotong() {
  const [vendors, setVendors] = useState([])
  const [form, setForm] = useState({
    vendor_id: '',
    tahun_pajak: new Date().getFullYear(),
    masa_pajak: '',
    jenis_pajak: '',
    file: null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchVendors = async () => {
      let { data } = await supabase.from('vendors').select()
      if (data) setVendors(data)
    }
    fetchVendors()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const filename = `${Date.now()}_${form.file.name}`
    const { error: uploadError } = await supabase.storage
      .from('bukti-potong')
      .upload(filename, form.file)

    if (uploadError) {
      alert('Gagal upload file: ' + uploadError.message)
      setLoading(false)
      return
    }

    const file_url = `https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/bukti-potong/${filename}`

    const { error: insertError } = await supabase.from('bukti_potong').insert({
      vendor_id: form.vendor_id,
      tahun_pajak: form.tahun_pajak,
      masa_pajak: form.masa_pajak,
      jenis_pajak: form.jenis_pajak,
      file_url,
      is_sent: false
    })

    if (insertError) {
      alert('Gagal simpan data: ' + insertError.message)
    } else {
      alert('Berhasil upload dan simpan bukti potong!')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold">Upload Bukti Potong Pajak</h2>
      <select
        className="w-full border p-2"
        value={form.vendor_id}
        onChange={(e) => setForm({ ...form, vendor_id: e.target.value })}
        required
      >
        <option value="">Pilih Vendor</option>
        {vendors.map((v) => (
          <option key={v.id} value={v.id}>{v.name}</option>
        ))}
      </select>

      <input
        type="number"
        className="w-full border p-2"
        placeholder="Tahun Pajak"
        value={form.tahun_pajak}
        onChange={(e) => setForm({ ...form, tahun_pajak: e.target.value })}
        required
      />

      <input
        type="text"
        className="w-full border p-2"
        placeholder="Masa Pajak (misal: Juni)"
        value={form.masa_pajak}
        onChange={(e) => setForm({ ...form, masa_pajak: e.target.value })}
        required
      />

      <input
        type="text"
        className="w-full border p-2"
        placeholder="Jenis Pajak (misal: PPh 23)"
        value={form.jenis_pajak}
        onChange={(e) => setForm({ ...form, jenis_pajak: e.target.value })}
        required
      />

      <input
        type="file"
        accept="application/pdf"
        className="w-full"
        onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
        required
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Mengupload...' : 'Upload & Simpan'}
      </button>
    </form>
  )
}
