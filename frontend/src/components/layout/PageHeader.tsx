interface Props {
  title: string;
  subtitle: string;
}

export default function PageHeader({

  title,

  subtitle,

}: Props) {

  return (

    <div className="mb-8">

      <h1 className="text-4xl font-bold tracking-tight">

        {title}

      </h1>

      <p className="mt-2 text-muted-foreground">

        {subtitle}

      </p>

    </div>

  );

}