async function test() {
  const res = await fetch("https://club-management.com/api/payments/stripe/public/intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNzg4MzU3MDc4LCJleHAiOjE3OTA5NDkwNzh9.Uka90k8Q4EtMXmuhLMaEyHn32enNZSO3GkPpKJmDRtk", item_type: "evenement", item_id: 1 })
  });
  const data = await res.json();
  console.log(data);
}
test();
