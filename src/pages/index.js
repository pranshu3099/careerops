import AuthScreen from '@/components/auth/Index'
import { hasRefreshToken } from '@/lib/auth'

export default function Home() {
  return (
    <div>
      <AuthScreen />
    </div>
  )
}

export async function getServerSideProps({ req }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`,
      {
        method: "GET",
        headers: {
          cookie: req.headers.cookie || "",
        },
      }
    );
    if (response.ok) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false,
        },
      };
    }
  } catch (err) {
    console.error("Auth check failed:", err);
  }

  return { props: {} };
}
