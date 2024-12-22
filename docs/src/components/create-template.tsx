import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import * as z from "zod";
import { useAuth } from "@/hooks/auth-provider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { API } from "@/client/api";

const LANGUAGES = [
	"python",
	"javascript",
	"typescript",
	"java",
	"c++",
	"ruby",
	"go",
	"rust",
];
const languages = LANGUAGES;
const formSchema = z.object({
	_id: z.string().min(2, {
		message: "Name must be at least 2 characters.",
	}),
	name: z.string().min(2, {
		message: "Name must be at least 2 characters.",
	}),
	version: z
		.string()
		.regex(
			/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
			{
				message: "Version must be a valid SemVer string",
			}
		),
	description: z.string().min(10, {
		message: "Description must be at least 10 characters.",
	}),
	author: z.string(),
	language: z.string().min(1, {
		message: "Please select a language.",
	}),
	//   tags: z.array(z.string()).min(1, {
	//     message: "Please select at least one tag.",
	//   }),
});

export function CreateTemplate() {
	const { user } = useAuth();
	// @ts-ignore
	const userID = user?.auth.currentUser.reloadUserInfo.screenName;

	const {
		handleSubmit,
		register,
		control,
		trigger,
		formState: { errors },
		...rest
	} = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			_id: "itsparsersd",
			version: "1.0.0",
			name: "",
			description: "",
			author: "",
			language: "",
		},
	});

	function onSubmit(values: z.infer<typeof formSchema>) {
		console.log(values);
		// Here you would typically send the data to an API
		let token = ""; // Retrieve token from your auth context or however it's stored
		token = user?.accessToken;
		API.createTemplate(
			{
				_id:
				// biome-ignore lint/style/useTemplate: <explanation>
					user?.reloadUserInfo?.screenName +
					"/" +
					values.name.replace(/[^a-zA-Z0-9]/g, "_"),
				name: values.name,
				description: values.description,
				language: values.language,
				tags: [values.language],
				status: "draft"
			},
			token
		)
			.then((response) => response.data)
			.catch((error: unknown) =>
				console.error("Error creating template:", error)
			);
	}

	// const handleAddTag = (tag: string) => {
	//     if (tag && !selectedTags.includes(tag)) {
	//         setSelectedTags(prev => [...prev, tag])
	//     }
	//     setOpenTagSelect(false)
	// }
	//
	// const handleRemoveTag = (tagToRemove: string) => {
	//     setSelectedTags(prev => prev.filter(tag => tag !== tagToRemove))
	// }
	//
	// const handleCreateNewTag = () => {
	//     if (newTag && !tags.includes(newTag)) {
	//         setTags(prev => [...prev, newTag])
	//         setSelectedTags(prev => [...prev, newTag])
	//         setNewTag('')
	//         setIsDialogOpen(false)
	//     }
	// }

	if (!user) {
		return null;
	}
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline">Create Template</Button>
			</DialogTrigger>
			<DialogContent className="xl:min-w-[30vw]">
				<DialogHeader>
					<DialogTitle>Create New Template</DialogTitle>
					<DialogDescription>
						Make changes to your profile here. Click save when you're done.
					</DialogDescription>
				</DialogHeader>
				<Form
					handleSubmit={handleSubmit}
					register={register}
					control={control}
					{...rest}
				>
					<form
						// onSubmit={handleSubmit((data) => {
						// 	console.log(data, "check heeere");
						// 	onSubmit(data);
						// })}
						onSubmit={(e) => {
							e.preventDefault();
							trigger();
							console.log(errors);
							if (Object.keys(errors).length === 0) {
								const formData = rest.getValues();
								console.log("form data", formData);
								onSubmit(formData);
							}
						}}
						className="space-y-4 w-full max-w-md"
					>
						<FormField
							// control={form.control}
							{...register("_id")}
							name="_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Template ID</FormLabel>
									<FormControl>
										<div className="flex">
											{/* <Input
                                                value={`${userID}/`}
                                                className="rounded-r-none bg-gray-100"
                                                disabled
                                            /> */}
											{/*<Input*/}
											{/*    {...field}*/}
											{/*    value={field.value.replace(userID, '')}*/}
											{/*    onChange={(e) => field.onChange(`${userID}/${e.target.value}`)}*/}
											{/*    className="rounded-l-none"*/}
											{/*/>*/}
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							// {...register("version")}
							name="version"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Version</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormDescription>
										Use semantic versioning (e.g., 1.0.0)
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							// {...register("name")}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							// {...register("description")}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							// {...register("author")}
							name="author"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Author</FormLabel>
									<FormControl>
										<Input {...field} disabled />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={control}
							// {...register("language")}
							name="language"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Language</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a language" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{languages?.map((lang) => (
												<SelectItem key={lang} value={lang}>
													{lang}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button type="submit" className="w-full">
							Submit
						</Button>
					</form>
				</Form>
				{/* <DialogFooter>
					<Button type="submit">Save changes</Button>
				</DialogFooter> */}
			</DialogContent>
		</Dialog>
	);
}