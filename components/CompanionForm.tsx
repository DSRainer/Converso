"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "./ui/textarea";
import { subjects, voices } from "@/constants/index";
import { createCompanion } from "@/lib/actions/companion.actions";
import { redirect } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, { message: "Companion is required" }),
  subject: z.enum(subjects as [string, ...string[]], {
    message: "Subject is required",
  }),
  topic: z.string().min(1, { message: "Topic is required" }),
  voice: z.enum(["male", "female"] as [string, ...string[]], {
    message: "Voice is required",
  }),
  style: z.enum(["casual", "formal"] as [string, ...string[]], {
    message: "Style is required",
  }),
  duration: z.number().min(1, { message: "Duration is required" }),
});

const CompanionForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      subject: "maths",
      topic: "",
      voice: "male",
      style: "casual",
      duration: 15,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const companion = await createCompanion(data);

    if (companion) {
      redirect(`/companion/${companion.id}`);
    } else {
      console.log("Failed to create a Companion");
      redirect("/");
    }
  };

  return (
    <Card className="w-full sm:max-w-md rounded-3xl">
      <CardHeader className="text-center">
        <CardTitle>Companion Form</CardTitle>
        <CardDescription>
          Add a Companion to customize your learning experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-demo" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-name">
                    Companion Name
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Neura the Brainy..."
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="subject"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-subject">
                    Choose a Subject
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="form-rhf-demo-subject"
                      aria-invalid={fieldState.invalid}
                      className="min-w-30 input capitalize rounded-lg"
                    >
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject.charAt(0).toUpperCase() + subject.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="topic"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-topic">
                    Enter a Topic
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="form-rhf-demo-topic"
                    aria-invalid={fieldState.invalid}
                    placeholder="Economics..."
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="voice"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-voice">Voice</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="form-rhf-demo-voice"
                      aria-invalid={fieldState.invalid}
                      className="min-w-30 input capitalize rounded-lg"
                    >
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.keys(voices).map((voice) => (
                          <SelectItem key={voice} value={voice}>
                            {voice.charAt(0).toUpperCase() + voice.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="style"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-style">
                    Voice Style
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="form-rhf-demo-style"
                      aria-invalid={fieldState.invalid}
                      className="min-w-30 input capitalize rounded-lg"
                    >
                      <SelectValue placeholder="Choose the voice style you prefer..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.keys(voices.male).map((style) => (
                          <SelectItem key={style} value={style}>
                            {style.charAt(0).toUpperCase() + style.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="duration"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-duration">
                    Enter a Duration
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-rhf-demo-duration"
                    aria-invalid={fieldState.invalid}
                    placeholder="15 Minutes"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="submit"
            form="form-rhf-demo"
            className="w-full cursor-pointer"
          >
            Build your Companion
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
};

export default CompanionForm;
