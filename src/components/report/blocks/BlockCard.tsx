import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function BlockCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  if (!title) {
    return <Card>{children}</Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
