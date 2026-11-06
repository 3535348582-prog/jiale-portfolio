export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1422] px-6 text-[#edf2f7]">
      <div className="max-w-xl space-y-6">
        <p className="text-sm tracking-[0.22em] text-[#d7bc7a]">STAR NOTES · 星际留言</p>
        <h1 className="text-3xl leading-relaxed sm:text-4xl">在这片星空，留下你的想法。</h1>
        <p className="leading-8 text-[#a8b9cc]">无需注册。带上自己的星座，和其他访客分享、回复、交流。</p>
        <a className="inline-block border border-[#d7bc7a]/50 px-6 py-3 text-[#e8d6a9]" href="https://jiale-shen-portfolio.surge.sh/#guestbook">前往作品集留言 →</a>
      </div>
    </main>
  );
}
