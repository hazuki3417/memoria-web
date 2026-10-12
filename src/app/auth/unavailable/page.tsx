export default function Page() {
  return (
    <main style={{ maxWidth: 520, margin: "15vh auto", padding: 24 }}>
      <h1>アカウントを利用できません</h1>
      <p>アカウントの状態を確認できないため、Memoriaを利用できません。</p>
      <p>
        <a href="/auth/logout">ログアウト</a>
      </p>
      <p>
        <a href="/dashboard">再試行</a>
      </p>
    </main>
  )
}
