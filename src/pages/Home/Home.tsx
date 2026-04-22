import {
  FiShield,
  FiLock,
  FiServer,
  FiArrowRight,
} from 'react-icons/fi'
import {
  MdCreditCard,
  MdFlight,
  MdDirectionsCar,
  MdLocalHospital,
  MdSchool,
  MdHome,
} from 'react-icons/md'

const features = [
  { icon: <FiLock size={20} />, label: 'Zero Access Architecture' },
  { icon: <FiServer size={20} />, label: 'AWS Hosted' },
  { icon: <FiShield size={20} />, label: 'End To End Encryption' },
  { icon: <MdCreditCard size={20} />, label: 'You Control All Access' },
]

const documents = [
  {
    icon: <MdCreditCard size={28} />,
    label: 'National ID & Voter\'s Card',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: <MdFlight size={28} />,
    label: 'International Passport',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: <MdDirectionsCar size={28} />,
    label: 'Driver\'s License & Vehicle Papers',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: <MdLocalHospital size={28} />,
    label: 'NHIS Card & Health Records',
    color: 'bg-red-100 text-red-600',
  },
  {
    icon: <MdSchool size={28} />,
    label: 'WAEC/NECO Certificates',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: <MdHome size={28} />,
    label: 'C of O & Property Docs',
    color: 'bg-green-100 text-green-700',
  },
]

const steps = [
  {
    title: 'Create Your Vault',
    desc: 'Sign up and set up your secure vault with a master password. Your vault is encrypted end-to-end.',
  },
  {
    title: 'Upload Documents',
    desc: 'Scan or upload photos of your important documents. Organize them by category for easy access.',
  },
  {
    title: 'Access Anytime',
    desc: 'View your documents from any device. Share securely with family or authorities when needed.',
  },
  {
    title: 'Stay Protected',
    desc: 'Your documents are backed up automatically. Even if your phone is lost, your vault remains safe.',
  },
]

function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <header className="border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
              01
            </div>
            <span className="font-semibold text-lg tracking-tight">MyPaperVault</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#documents" className="hover:text-primary transition-colors">Documents</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
            <a href="#plans" className="hover:text-primary transition-colors">Plans</a>
          </nav>
          <button className="bg-primary text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Get Started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="max-w-2xl mx-auto text-center">
          {/* Trust badge */}
          <div className="inline-flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-10 text-left max-w-lg">
            <FiShield className="text-primary mt-0.5 shrink-0" size={16} />
            <p className="text-sm text-blue-800 leading-relaxed">
              MyPaperVault uses encryption and controlled access architecture to protect your documents.
              Only the account holder determines who can grant access.
            </p>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight mb-5">
            Protect Your Important Documents.{' '}
            <span className="text-primary">Permanently.</span>
          </h1>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            A secure digital vault for land records, identity documents, financial files, and legal paperwork.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
              Create Secure Vault <FiArrowRight size={18} />
            </button>
            <button
              id="plans"
              className="flex items-center gap-2 border border-gray-300 text-gray-700 px-7 py-3.5 rounded-xl font-semibold text-base hover:border-primary hover:text-primary transition-colors"
            >
              <FiShield size={16} /> View Plans
            </button>
          </div>
        </div>

        {/* Feature badges */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {features.map((f) => (
            <div
              key={f.label}
              className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl px-4 py-5 text-center"
            >
              <span className="text-primary">{f.icon}</span>
              <span className="text-xs font-medium text-gray-600 leading-tight">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Documents */}
      <section id="documents" className="bg-gray-50 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Perfect for Nigerian Documents</h2>
            <p className="text-gray-500">Store and access all your important documents in one secure place.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {documents.map((doc) => (
              <div
                key={doc.label}
                className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${doc.color}`}>
                  {doc.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 leading-snug">{doc.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
          <p className="text-gray-500">Get started in minutes and keep your documents safe forever.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start protecting your documents today</h2>
          <p className="text-blue-100 mb-8">Join thousands of Nigerians who trust MyPaperVault.</p>
          <button className="bg-white text-primary px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
            Create Free Vault
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-xs font-bold">
              01
            </div>
            <span className="font-medium text-gray-600">MyPaperVault</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
          </div>
          <span>© {new Date().getFullYear()} MyPaperVault. All rights reserved.</span>
        </div>
      </footer>
    </div>
  )
}

export default Home
