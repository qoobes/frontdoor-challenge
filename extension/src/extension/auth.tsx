import clsx from "clsx";
import { useSetAtom } from "jotai";
import { useRef, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { axiosInstance } from "../utils/axios";
import { setToken } from "../utils/storage";
import { authedAtom } from "./extension_popup";

export const AuthPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuthed = useSetAtom(authedAtom);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<"login" | "signup">("login");

  const handleLogin = () => {
    setLoading(true);

    if (!emailRef.current?.value || !passwordRef.current?.value) {
      setLoading(false);
      setError("Please fill out all fields.");
      return;
    }

    const simpleEmailRegex = /^[^@]+@[^@]+\.[^@]+$/;

    if (!emailRef.current?.value.match(simpleEmailRegex)) {
      setLoading(false);
      setError("Please enter a valid email.");
      return;
    }

    axiosInstance
      .post(form === "login" ? "/auth/login" : "/auth/register", {
        email: emailRef.current?.value,
        password: passwordRef.current?.value,
      })
      .then((res) => {
        if (res.data.token) {
          setToken(res.data.token).then(() => {
            setLoading(false);
            setError("");
            setAuthed(true);
          });
          return;
        }
      })
      .catch((err) => {
        setLoading(false);
        setError(
          err.response.data.message === "Internal server error"
            ? "Invalid email or password."
            : err.response.data.message,
        );
      });
  };

  return (
    <div className="w-[300px] text-center flex items-center flex-col bg-white text-black p-8 transition-all">
      <h1 className="font-bold text-3xl text-black mb-4 font-space transition-all">
        {form === "login" ? "Login" : "Register"}
      </h1>

      <input
        ref={emailRef}
        className="border text-sm border-gray-300 rounded-md px-4 py-2 mt-4 w-full ring-0 outline-none bg-white text-black transition-all focus:border-black"
        placeholder="Email"
        type="email"
      />
      <input
        ref={passwordRef}
        className="border text-sm focus:border-black border-gray-300 rounded-md px-4 py-2 mt-2 w-full bg-white ring-0 outline-none text-black transition-all"
        placeholder="Password"
        type="password"
      />
      <div
        className={clsx(
          "w-full text-left flex items-center text-sm rounded-md text-red-400 transition mt-2 mb-4",
          error ? "opacity-100" : "opacity-0",
        )}
      >
        {error}
      </div>

      <button
        onClick={handleLogin}
        className={clsx(
          loading ? "bg-black cursor-not-allowed" : "",
          "border border-black leading-none flex items-center justify-center text-center bg-black text-white",
          "rounded-lg px-3 py-2.5 w-full hover:bg-white text-sm hover:text-black transition-all",
        )}
      >
        {loading ? (
          <div className="animate-spin">
            <FaSpinner />
          </div>
        ) : form === "login" ? (
          "Sign in"
        ) : (
          "Sign up"
        )}
      </button>

      {form === "login" ? (
        <p className="mt-4 text-gray-500 transition-all text-sm">
          Don't have an account?{" "}
          <button
            className="text-black hover:underline"
            onClick={() => setForm("signup")}
          >
            Sign up
          </button>
        </p>
      ) : (
        <p className="mt-4 text-gray-500 transition-all text-sm">
          Already have an account?{" "}
          <button
            className="text-black hover:underline"
            onClick={() => setForm("login")}
          >
            Sign in
          </button>
        </p>
      )}
      <p className="mt-4 text-gray-500 transition-all text-sm">
        <a
          className="text-black hover:underline"
          target="_blank"
          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
        >
          Sign up 2? What does it do?
        </a>
      </p>
    </div>
  );
};
