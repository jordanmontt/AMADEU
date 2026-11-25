/**
 * YouTube embeds in privacy-enhanced mode (RF-31, RT-24): the player is only requested
 * after the visitor clicks, and from youtube-nocookie.com.
 */
export function youtubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&rel=0`;
}
