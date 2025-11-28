export default function Checker({ color, size = 'md', onClick }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const colors = {
    white: 'bg-gray-100 border-gray-300',
    black: 'bg-gray-900 border-gray-700',
    red: 'bg-red-600 border-red-700',
    blue: 'bg-blue-600 border-blue-700'
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${sizes[size]}
        ${colors[color] || colors.white}
        rounded-full border-4 shadow-lg checker
        flex items-center justify-center
        relative
      `}
    >
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
    </div>
  );
}
