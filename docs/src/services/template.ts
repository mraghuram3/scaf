import {Template as TemplateModel} from "@/models/template";
import connectDB from "@/lib/mongodb";
import {PageOptionV2} from "@/models/common";

export interface CreateTemplateDTO {
  _id?: string;
  name: string;
  description?: string;
  language: string;
  tags: string[];
  status: string;
}


export class TemplateService {
  static async createTemplate(data: CreateTemplateDTO) {
    await connectDB();
    return TemplateModel.create(data);
  }

  static async getTemplates(options: PageOptionV2){
    await connectDB();

    const query: any = {};
    if (options.search) {
      query.$or = [
        { name: { $regex: options.search, $options: "i" } },
        { description: { $regex: options.search, $options: "i" } },
      ];
    }


    const [templates, total] = await Promise.all([
      TemplateModel.find(query)
        .sort({ createdAt: -1 })
        .skip(options.skip)
        .limit(options.limit)
        .lean(),
      TemplateModel.countDocuments(query),
    ]);

    return {
      data: templates,
      pagination: {
        total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  static async getTemplateById(id: string) {
    await connectDB();
    return TemplateModel.findById(id).lean();
  }

  static async updateTemplate(id: string, data: Partial<CreateTemplateDTO>) {
    await connectDB();
    return TemplateModel.findByIdAndUpdate(id, data, { new: true }).lean();
  }

  static async deleteTemplate(id: string) {
    await connectDB();
    return TemplateModel.findByIdAndDelete(id);
  }
}
