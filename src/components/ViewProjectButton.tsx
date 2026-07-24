export default function ViewProjectButton({ url }: { url: string }) {
  return (
    <MagneticButton
      variant="solid"
      onClick={() => {
        hapticTap("medium");
        openExternal(url);
      }}
    >
      Посмотреть проект
    </MagneticButton>
  );
}
