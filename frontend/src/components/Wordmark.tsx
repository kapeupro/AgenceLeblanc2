interface Props { size?: 'md' | 'lg'; tone?: 'light' | 'dark'; }

export function Wordmark({ size = 'md', tone = 'light' }: Props) {
  const nameSize = size === 'lg' ? 'text-[34px]' : 'text-[24px]';
  const sinceSize = size === 'lg' ? 'text-[29px]' : 'text-[21px]';
  const color = tone === 'light' ? 'text-white' : 'text-navy';
  return (
    <span className="inline-flex flex-col leading-none">
      <span className={`font-display font-normal tracking-[.02em] uppercase leading-none whitespace-nowrap ${nameSize} ${color}`}>
        Agence Leblanc
      </span>
      <span className={`font-script font-normal leading-none mt-1 ${sinceSize} ${color}`}>
        Depuis 1926
      </span>
    </span>
  );
}
