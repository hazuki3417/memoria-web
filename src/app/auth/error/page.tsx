export default function Page() {
  return (
    <main style={{ maxWidth: 520, margin: "15vh auto", padding: 24 }}>
      <h1>接続できませんでした</h1>
      <p>ユーザー情報を取得できませんでした。時間をおいて再試行してください。</p>
      <p><a href="/auth/logout">ログアウト</a></p>
      <p><a href="/dashboard">再試行</a></p>
    </main>
  )
}
