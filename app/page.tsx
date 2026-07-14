export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Agromoreira</h1>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        Loja de produtos animais e agrícolas
      </p>
      <p className="text-sm text-zinc-400">
        Frontend em construção · API: {process.env.NEXT_PUBLIC_API_URL}
      </p>
    </main>
  );
}
