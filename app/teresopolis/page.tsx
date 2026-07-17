import { HomeListing } from "@/components/properties/home-listing";

export const metadata = {
  title: "Imóveis em Teresópolis",
  description:
    "Portfólio em Teresópolis com atendimento de Regal e Ferraro.",
};

export default function TeresopolisPage() {
  return <HomeListing variant="teresopolis" />;
}
