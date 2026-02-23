/**
 * Parses the Google Drive "Virus scan warning" form and returns the GET URL
 * with all query params (action + id, export, confirm, uuid, etc.).
 * Returns null if the form cannot be parsed.
 */
export function parseVirusScanForm(html: string): string | null {
    const actionMatch = html.match(/action=["']([^"']+)["']/i);
    if (!actionMatch) return null;
    const action = actionMatch[1].trim();
    const params = new URLSearchParams();

    const inputRegex = /<input[^>]+>/gi;
    let match: RegExpExecArray | null;
    while ((match = inputRegex.exec(html)) !== null) {
        const tag = match[0];
        const nameMatch = tag.match(/name=["']([^"']+)["']/i);
        const valueMatch = tag.match(/value=["']([^"']*)["']/i);
        if (nameMatch && valueMatch) params.set(nameMatch[1], valueMatch[1]);
    }

    if (params.size === 0) return null;
    const query = params.toString();
    return query ? `${action.replace(/\?$/, "")}?${query}` : action;
}

function isHtmlResponse(res: Response, bodyStart: string): boolean {
    const ct = res.headers.get("Content-Type") ?? "";
    if (ct.includes("text/html")) return true;
    const trimmed = bodyStart.trimStart();
    return trimmed.startsWith("<!") || trimmed.startsWith("<!DOCTYPE");
}

/**
 * Fetches the download URL; if the response is the "Virus scan warning" page (200 HTML),
 * parses the form and fetches the confirmation URL, then returns the final response.
 */
export async function fetchDownloadResponse(
    url: string,
    signal?: AbortSignal
): Promise<Response> {
    const res = await fetch(url, { redirect: "manual", signal });
    if (res.status === 303) {
        const loc = res.headers.get("Location");
        if (loc) return fetchDownloadResponse(loc, signal);
        throw new Error("303 without Location");
    }
    if (res.status !== 200) {
        throw new Error(`Fetch failed: ${res.status}`);
    }
    const text = await res.text();
    if (!isHtmlResponse(res, text.slice(0, 100))) {
        return new Response(text, { status: res.status, headers: res.headers });
    }
    const confirmUrl = parseVirusScanForm(text);
    if (!confirmUrl) return new Response(text, { status: res.status, headers: res.headers });
    const confirmRes = await fetch(confirmUrl, { redirect: "follow", signal });
    if (!confirmRes.ok) throw new Error(`Confirm fetch failed: ${confirmRes.status}`);
    return confirmRes;
}