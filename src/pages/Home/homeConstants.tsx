import {
  MdOutlineArchive,
  MdOutlinePeopleAlt,
  MdOutlineFolderSpecial,
  MdOutlineLink,
  MdOutlineShield,
  MdOutlineLock,
} from "react-icons/md";

export const quickActions = [
  {
    icon: <MdOutlineArchive size={22} />,
    title: "Document Archive",
    desc: "Browse all documents",
    to: "/documents",
  },
  {
    icon: <MdOutlinePeopleAlt size={22} />,
    title: "Family Access",
    desc: "Manage sharing",
    to: "/family",
  },
  {
    icon: <MdOutlineFolderSpecial size={22} />,
    title: "My Family Vaults",
    desc: "Shared with you",
    to: "/vaults",
  },
  {
    icon: <MdOutlineLink size={22} />,
    title: "Generate Secure Upload Link",
    desc: "Secure upload link",
    to: "/links",
  },
];

export const securityItems = [
  {
    label: "MFA",
    icon: <MdOutlineLock size={14} />,
    badge: "Enabled",
    badgeClass: "bg-green-100 text-green-700",
  },
  {
    label: "Encryption",
    icon: <MdOutlineShield size={14} />,
    badge: "Active",
    badgeClass: "bg-green-100 text-green-700",
  },
  {
    label: "Active Links",
    icon: <MdOutlineLink size={14} />,
    badge: "4 links",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  {
    label: "Family Access",
    icon: <MdOutlinePeopleAlt size={14} />,
    badge: "3 members",
    badgeClass: "bg-blue-100 text-blue-700",
  },
];
