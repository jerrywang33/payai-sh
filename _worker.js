const PAYBOT_HOSTS = new Set(["paybot.sh", "www.paybot.sh"]);

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const hostname = new URL(request.url).hostname;

    if (!PAYBOT_HOSTS.has(hostname) || !isTransformable(response)) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.delete("content-length");

    return new Response(toPayBot(await response.text()), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

function isTransformable(response) {
  const contentType = response.headers.get("content-type") ?? "";
  return (
    contentType.includes("text/") ||
    contentType.includes("application/javascript") ||
    contentType.includes("application/json") ||
    contentType.includes("application/xml") ||
    contentType.includes("image/svg+xml")
  );
}

function toPayBot(html) {
  return html
    .replaceAll("PAYAI", "PAYBOT")
    .replaceAll("PayAI", "PayBot")
    .replaceAll("payai", "paybot")
    .replaceAll("paybot-sh", "payai-sh")
    .replaceAll("PayBotFetch", "PayAIFetch")
    .replaceAll("paybotFetch", "payaiFetch");
}
