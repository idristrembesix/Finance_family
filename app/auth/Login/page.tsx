import React from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";

const LoginFinance = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 px-6">

      {/* Glow Effect */}
      <div className="absolute w-96 h-96 bg-indigo-600 opacity-30 blur-3xl rounded-full"></div>

      {/* Card */}
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-8">

        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            FinanceFamily
          </h1>
          <p className="text-zinc-400 text-sm mt-2">
            Login untuk mengelola keuangan keluarga
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5">

          {/* Email */}
          <div>
            <label className="text-sm text-zinc-400">Email</label>

            <div className="flex items-center mt-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3">
              <FaEnvelope className="text-zinc-400 mr-2" />
              <input
                type="email"
                placeholder="email@gmail.com"
                className="bg-transparent w-full py-3 outline-none text-white"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-zinc-400">Password</label>

            <div className="flex items-center mt-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3">
              <FaLock className="text-zinc-400 mr-2" />
              <input
                type="password"
                placeholder="********"
                className="bg-transparent w-full py-3 outline-none text-white"
              />
            </div>
          </div>

          {/* Forgot */}
          <div className="text-right text-sm">
            <a className="text-indigo-400 hover:text-indigo-300 cursor-pointer">
              Forgot password?
            </a>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 transition py-3 rounded-lg font-medium text-white shadow-lg"
          >
            Login
          </button>

        </form>

        {/* Register */}
        <p className="text-center text-zinc-400 text-sm mt-6">
          Belum punya akun?{" "}
          <a className="text-indigo-400 hover:text-indigo-300 cursor-pointer">
            Daftar sekarang
          </a>
        </p>

      </div>
    </div>
  );
};

export default LoginFinance;