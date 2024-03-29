/**
 * Licensed to Open-Ones Group under one or more contributor license
 * agreements. See the NOTICE file distributed with this work
 * for additional information regarding copyright ownership.
 * Open-Ones Group licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a
 * copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
package openones.gate.util;

import java.util.ArrayList;
import java.util.List;

import openones.gate.form.TabModuleOutForm;
import openones.gate.form.setting.TabForm;
import openones.gate.store.dto.ModuleContentDTO;
import openones.gate.store.dto.ModuleDTO;
import rocky.common.CommonUtil;
import rocky.common.Constant;

/**
 * This class provides utilities to manipulate the entities, forms.
 * 
 * @author Thach Le
 */
public class DtoUtil {

    /**
     * Convert entity Introduction into the formatted data.
     * 
     * @param dto entity of Introduction
     * @return formatted data form
     */
    public static TabModuleOutForm dto2IntroForm(ModuleDTO dto) {
        TabModuleOutForm form = new TabModuleOutForm();

        form.setType(dto.getType());
        form.setContent(dto.getStringContent());
        form.setKey(String.valueOf(dto.getKey()));
        if (dto.getCreated() != null) {
            form.setCreated(CommonUtil.formatDate(dto.getCreated(), Constant.DEF_DATEFMT));
        }

        return form;
    }

    /**
     * Convert list of ModuleDTO into list of IntroOutForm.
     * 
     * @param dtoList list of entity Introduction
     * @return list of formatted Introduction data
     */
    public static List<TabModuleOutForm> dto2IntroFormList(List<ModuleDTO> dtoList) {
        List<TabModuleOutForm> formList = new ArrayList<TabModuleOutForm>();

        for (ModuleDTO dto : dtoList) {
            formList.add(dto2IntroForm(dto));
        }

        return formList;
    }

    public static TabForm dto2TabForm(ModuleDTO dto) {
        TabForm form = new TabForm(dto.getId(), dto.getName());

        return form;
    }

    public static List<TabForm> dto2TabFormList(List<ModuleDTO> dtoList) {
        List<TabForm> formList = new ArrayList<TabForm>();

        for (ModuleDTO dto : dtoList) {
            formList.add(dto2TabForm(dto));
        }

        return formList;
    }

    /**
     * [Give the description for method].
     * @param moduleConentList
     * @return
     */
    public static List<TabModuleOutForm> dto2TabModuleFormList(List<ModuleContentDTO> moduleConentList) {
        List<TabModuleOutForm> formList = new ArrayList<TabModuleOutForm>();

        for (ModuleContentDTO dto : moduleConentList) {
            formList.add(dto2ModuleConentForm(dto));
        }

        return formList;
    }

    /**
     * [Give the description for method].
     * @param dto
     * @return
     */
    private static TabModuleOutForm dto2ModuleConentForm(ModuleContentDTO dto) {
        TabModuleOutForm form = new TabModuleOutForm();

        form.setContent(dto.getContent().getValue());
        form.setLang(dto.getLang());
        form.setKey(String.valueOf(dto.getKey()));
        if (dto.getCreated() != null) {
            form.setCreated(CommonUtil.formatDate(dto.getCreated(), Constant.DEF_DATEFMT));
        }

        return form;
    }
}
