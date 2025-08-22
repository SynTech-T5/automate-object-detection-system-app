import AlertTable from "../../components/AlertTable"
export default async function Page() {

  return (
    <div className="rounded-lg bg-[var(--color-white)] shadow-md p-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
        <AlertTable />
      </div>
    </div>
  );
}