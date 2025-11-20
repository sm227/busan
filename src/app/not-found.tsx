import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <Image
          src="/logo.png"
          alt="404 캐릭터"
          width={200}
          height={200}
          className="mx-auto mb-8"
          priority
        />

        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>

        <p className="text-xl text-gray-600 mb-2">
          앗! 길을 잃으셨나요?
        </p>

        <p className="text-gray-500 mb-8">
          찾으시는 페이지가 없어요
        </p>

        <Link
          href="/"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-full transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
