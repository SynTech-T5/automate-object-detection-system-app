"use client";
import { forwardRef, useEffect, useRef } from "react";

function parseBasicAuth(rtsp: string): string | undefined {
    const m = rtsp.match(/^rtsp:\/\/([^:@]+):([^@]+)@/i);
    return m ? "Basic " + btoa(`${decodeURIComponent(m[1])}:${decodeURIComponent(m[2])}`) : undefined;
}

type Props = {
    camAddressRtsp: string;
    webrtcBase?: string;
    onFailure?: () => void;
    maxRetries?: number;
    disconnectGraceMs?: number;
};

const WhepPlayer = forwardRef<HTMLVideoElement, Props>(function WhepPlayer(
    { camAddressRtsp, webrtcBase = "http://localhost:8889", onFailure, maxRetries = 2, disconnectGraceMs = 5000 },
    ref
) {
    const innerVideoRef = useRef<HTMLVideoElement | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const retriesRef = useRef(0);
    const sessionIdRef = useRef(0);

    // sync ref
    const setVideoRef = (el: HTMLVideoElement | null) => {
        innerVideoRef.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.MutableRefObject<HTMLVideoElement | null>).current = el;
    };

    const connect = async (sid: number) => {
        try {
            const m = camAddressRtsp.match(/^rtsp:\/\/(?:[^@]*@)?[^/]+\/(.+)$/i);
            const path = m?.[1];
            if (!path) return false;

            const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
            pcRef.current = pc;

            const transceiver = pc.addTransceiver("video", { direction: "recvonly" });

            try {
                const caps = RTCRtpReceiver.getCapabilities("video");
                const h264First =
                    (caps?.codecs ?? [])
                        .filter((c) => /H264/i.test(c.mimeType))
                        .concat((caps?.codecs ?? []).filter((c) => !/H264/i.test(c.mimeType)));
                // @ts-ignore
                transceiver.setCodecPreferences?.(h264First);
            } catch {}

            const ms = new MediaStream();
            pc.ontrack = (ev) => {
                if (sid !== sessionIdRef.current) return;
                ms.addTrack(ev.track);
                if (innerVideoRef.current) {
                    innerVideoRef.current.srcObject = ms;
                    innerVideoRef.current.play().catch(() => {});
                }
            };

            pc.oniceconnectionstatechange = () => {
                if (sid !== sessionIdRef.current) return;
                if (["failed", "closed"].includes(pc.iceConnectionState)) {
                    cleanup(sid);
                    if (retriesRef.current < maxRetries) {
                        retriesRef.current += 1;
                        connect(sid);
                    } else {
                        onFailure?.();
                    }
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            await new Promise<void>((resolve) => {
                if (pc.iceGatheringState === "complete") return resolve();
                const h = () => {
                    if (pc.iceGatheringState === "complete") {
                        pc.removeEventListener("icegatheringstatechange", h);
                        resolve();
                    }
                };
                pc.addEventListener("icegatheringstatechange", h);
            });

            const whepUrl = `${webrtcBase.replace(/\/+$/, "")}/${encodeURIComponent(path)}/whep`;

            const headers: Record<string, string> = {
                "Content-Type": "application/sdp",
                "Accept": "application/sdp",
            };
            const auth = parseBasicAuth(camAddressRtsp);
            if (auth) headers.Authorization = auth;

            const resp = await fetch(whepUrl, { method: "POST", headers, body: pc.localDescription?.sdp ?? "" });
            if (!resp.ok) {
                if (resp.status === 404) {
                    retriesRef.current = maxRetries;
                    onFailure?.();
                }
                return false;
            }

            const answer = await resp.text();
            await pc.setRemoteDescription({ type: "answer", sdp: answer });
            return true;
        } catch {
            return false;
        }
    };

    const cleanup = (sid: number) => {
        if (sid !== sessionIdRef.current) return;
        const pc = pcRef.current;
        pcRef.current = null;
        try {
            pc?.getTransceivers().forEach((t) => t.stop?.());
            pc?.close();
        } catch {}
    };

    useEffect(() => {
        retriesRef.current = 0;
        const sid = ++sessionIdRef.current;
        connect(sid);
        return () => cleanup(sid);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [camAddressRtsp, webrtcBase]);

    return (
        <video
            ref={setVideoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover rounded-md"
        />
    );
});

export default WhepPlayer;