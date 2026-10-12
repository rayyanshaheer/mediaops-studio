import type { Metadata } from "next";
import { LoginForm } from "./login-form";
export const metadata: Metadata = { title: "Sign in" };
export default function LoginPage() { return <main className="login-wrap"><section className="login-art"><div className="wordmark"><span className="mark"/>MediaOps Studio</div><h1>One approved image. Every channel, ready.</h1><div className="format-line" aria-hidden="true"><span style={{height:92}}/><span style={{height:116}}/><span style={{height:62,width:118}}/><span style={{height:130,width:74}}/></div></section><section className="login-panel"><div className="login-box"><h1>Sign in</h1><p className="subtle">Use the configured owner account to manage releases.</p><LoginForm /></div></section></main>; }
