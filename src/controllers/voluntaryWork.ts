import { In } from "typeorm";
import { NSVoluntaryWork } from "../../types/voluntaryWork.js";
import { SkillTag } from "../db/entities/SkillTag.js";
import { VoluntaryWork } from "../db/entities/VoluntaryWork.js";

const createVoluntaryWork = async (payload: NSVoluntaryWork.Item) => {
    try {
        const newVoluntaryWork = VoluntaryWork.create(payload);
        const skillTags = await SkillTag.find({
            where: { id: In(payload.skillTagIds) },
        });
        newVoluntaryWork.skillTags = skillTags;
        return newVoluntaryWork.save();
    }
    catch (error) {
        console.log(error);
    }
}

const deleteVoluntaryWork = async (voluntaryWorkId: number) => {
    return VoluntaryWork.delete(voluntaryWorkId);
}

const editVoluntaryWork = async (payload: NSVoluntaryWork.Edit) => {
    let voluntaryWork = await VoluntaryWork.findOne({ where: { id: payload.id } });
    if (voluntaryWork) {
        voluntaryWork = Object.assign(voluntaryWork, payload);
        return voluntaryWork?.save();

    } else {
        throw "VoluntaryWork not found :(";
    }
}

const getVoluntaryWork = (payload: { id: number }) => {
    return VoluntaryWork.findOne({ where: { id: payload.id } })
}

const getVoluntaryWorks = async (payload: {
    page: string,
    pageSize: string
}) => {

    const page = parseInt(payload.page);
    const pageSize = parseInt(payload.pageSize);

    const [VoluntaryWorks, total] = await VoluntaryWork.findAndCount({
        skip: pageSize * (page - 1),
        take: pageSize,
        order: {
            createdAt: 'ASC'
        }
    })

    return {
        page,
        pageSize: VoluntaryWorks.length,
        total,
        VoluntaryWorks
    };
}

export { createVoluntaryWork, editVoluntaryWork, getVoluntaryWork, getVoluntaryWorks, deleteVoluntaryWork }