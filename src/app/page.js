'use client'
import { useState } from 'react';

export default function Home() {
    const [formData, setFormData] = useState({
        amyloid_beta: '',
        tau_p: '',
        neurofilament: '',
        apoe_genotype: '',
        fdg_pet: '',
        alpha_synuclein: '',
        dat_ratio: '',
        vps35_genotype: ''
    });
    const [diagnosis, setDiagnosis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setDiagnosis(null);

        try {
            const response = await fetch('/api/diagnose', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to get diagnosis');
            if (!data.diagnosis) throw new Error('No diagnosis received from server');
            setDiagnosis(data.diagnosis);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg w-full text-center">
                <h1 className="text-3xl font-bold text-black mb-6">Neurological Diagnosis</h1>
                <div className="bg-yellow-100 text-black p-4 rounded mb-6">
                    <p className="font-semibold">Medical Disclaimer:</p>
                    <p>This tool is for research and educational purposes only. Always consult a healthcare professional.</p>
                </div>
                {error && <div className="bg-red-100 text-black p-4 rounded mb-6">{error}</div>}
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block font-semibold capitalize text-black">amyloid beta</label>
                        <input
                            name="amyloid_beta"
                            type="number"
                            value={formData.amyloid_beta}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-black"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold capitalize text-black">tau p</label>
                        <input
                            name="tau_p"
                            type="number"
                            value={formData.tau_p}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-black"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold capitalize text-black">neurofilament</label>
                        <input
                            name="neurofilament"
                            type="number"
                            value={formData.neurofilament}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-black"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold capitalize text-black">apoe genotype</label>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                name="apoe_genotype"
                                value="true"
                                onClick={() => handleInputChange({ target: { name: "apoe_genotype", value: "true" } })}
                                className={`w-full p-3 border rounded-lg ${formData.apoe_genotype === "true" ? "bg-blue-500 text-white" : "bg-gray-200 text-black border-gray-400"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                                True
                            </button>
                            <button
                                type="button"
                                name="apoe_genotype"
                                value="false"
                                onClick={() => handleInputChange({ target: { name: "apoe_genotype", value: "false" } })}
                                className={`w-full p-3 border rounded-lg ${formData.apoe_genotype === "false" ? "bg-blue-500 text-white" : "bg-gray-200 text-black border-gray-400"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                                False
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block font-semibold capitalize text-black">fdg pet</label>
                        <input
                            name="fdg_pet"
                            type="number"
                            value={formData.fdg_pet}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-black"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold capitalize text-black">alpha synuclein</label>
                        <input
                            name="alpha_synuclein"
                            type="number"
                            value={formData.alpha_synuclein}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-black"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold capitalize text-black">dat ratio</label>
                        <input
                            name="dat_ratio"
                            type="number"
                            value={formData.dat_ratio}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-black"
                        />
                    </div>
                    <div>
                        <label className="block font-semibold capitalize text-black">vps35 genotype</label>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                name="vps35_genotype"
                                value="true"
                                onClick={() => handleInputChange({ target: { name: "vps35_genotype", value: "true" } })}
                                className={`w-full p-3 border rounded-lg ${formData.vps35_genotype === "true" ? "bg-blue-500 text-white" : "bg-gray-200 text-black border-gray-400"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                                True
                            </button>
                            <button
                                type="button"
                                name="vps35_genotype"
                                value="false"
                                onClick={() => handleInputChange({ target: { name: "vps35_genotype", value: "false" } })}
                                className={`w-full p-3 border rounded-lg ${formData.vps35_genotype === "false" ? "bg-blue-500 text-white" : "bg-gray-200 text-black border-gray-400"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            >
                                False
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Get Diagnosis'}
                    </button>
                </form>
                {diagnosis !== null && (
                    <div className={`mt-6 p-4 rounded-lg text-center ${diagnosis === 'Healthy' ? 'bg-green-100 text-black' : 'bg-blue-100 text-black'}`}>
                        <p className="font-bold text-lg">Diagnosis Result</p>
                        <p className="text-xl font-semibold mt-2">{diagnosis}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
