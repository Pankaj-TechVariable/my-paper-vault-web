import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiArrowLeft,
  HiShieldCheck,
} from "react-icons/hi";
import { MdLockOutline, MdPeopleOutline, MdCloudQueue } from "react-icons/md";
import Button from "@/components/common/Button/Button";
import TextInput from "@/components/common/TextInput/TextInput";
import PasswordInput from "@/components/common/PasswordInput";
import Navbar from "@/components/layout/Navbar/Navbar";
import { SigninSchema, type SigninFormData } from "@/schemas/auth";

const features = [
  {
    icon: <MdLockOutline size={16} />,
    text: "Zero-Access Encryption — only you hold the key",
  },
  {
    icon: <MdPeopleOutline size={16} />,
    text: "Controlled family sharing with permission levels",
  },
  {
    icon: <MdCloudQueue size={16} />,
    text: "AWS-hosted, available 24/7 on any device",
  },
];

const Login = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SigninFormData>({
    resolver: zodResolver(SigninSchema),
  });

  const onSubmit = async () => {
    navigate("/mfa");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left panel — hidden on mobile */}
        <div className="relative hidden lg:flex flex-col justify-center px-16 py-12 bg-linear-to-br from-[#0d1b4b] via-[#1e3fa8] to-[#3a6bef] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(58,107,239,0.3)_0%,transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(245,166,35,0.15)_0%,transparent_50%)]" />
          </div>

          <div className="relative z-10">
            <h2
              className="text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-4"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Your documents,
              <br />
              secured forever.
            </h2>
            <p className="text-sm xl:text-base text-white/70 leading-relaxed mb-10 max-w-sm">
              Access your encrypted vault from any device, share securely with
              family, and never lose an important document again.
            </p>

            <div className="flex flex-col gap-3.5">
              {features.map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white shrink-0">
                    {f.icon}
                  </div>
                  <span className="text-sm text-white/80">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex flex-col justify-center items-center px-6 py-10 md:px-16 bg-white">
          <div className="w-full max-w-md">
            <h2
              className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Welcome Back
            </h2>
            <p className="text-sm text-slate-400 mb-8">
              Log in to access your secure vault
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Email */}
              <div className="mb-4">
                <TextInput
                  label="Email Address"
                  type="text"
                  placeholder="your@email.com"
                  autoComplete="off"
                  start={<HiOutlineMail className="text-slate-400 shrink-0 mr-2" size={18} />}
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              {/* Password */}
              <div className="mb-2">
                <PasswordInput
                  label="Password"
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  start={<HiOutlineLockClosed className="text-slate-400 shrink-0 mr-2" size={18} />}
                  error={errors.password?.message}
                  {...register("password")}
                />
              </div>

              <div className="text-right mb-6">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary hover:underline no-underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                label="Log In"
                variant="contained"
                className="w-full justify-center mb-4"
                loading={isSubmitting}
              />

              {/* Security notice */}
              <div className="flex items-start gap-3 bg-blue-50 border border-[#c7d7fd] rounded-lg px-3.5 py-3 mb-6">
                <HiShieldCheck
                  className="text-primary shrink-0 mt-0.5"
                  size={15}
                />
                <p className="text-xs text-blue-700 leading-relaxed">
                  Your login credentials are encrypted and transmitted securely
                  via a protected connection.
                </p>
              </div>
            </form>

            <p className="text-center text-xs text-slate-400 mb-8">
              Need help?{" "}
              <Link
                to="/support"
                className="text-slate-500 no-underline hover:underline"
              >
                Contact Support
              </Link>
            </p>

            <div className="text-center">
              <Button
                label="Back to Home"
                variant="text"
                startIcon={<HiArrowLeft size={13} />}
                onClick={() => navigate("/")}
                labelClassName="!text-slate-400 !font-medium"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
