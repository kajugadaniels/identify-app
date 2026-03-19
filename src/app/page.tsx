export default function Home() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="glass-lg rounded-2xl p-10 max-w-md w-full text-center">
                <h1 className="text-4xl font-bold mb-3 gradient-text">
                    VerifyID
                </h1>
                <p className="text-white/60 text-sm">
                    Glassmorphism foundation working
                </p>
                <div className="mt-6 flex gap-3 justify-center">
                    <div className="h-2 w-2 rounded-full bg-indigo-400 animate-bounce" />
                    <div className="h-2 w-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="h-2 w-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
            </div>
        </div>
    );
}