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
package openones.gate.store.dto;

import java.io.Serializable;
import java.util.Date;

import javax.jdo.annotations.IdGeneratorStrategy;
import javax.jdo.annotations.PersistenceCapable;
import javax.jdo.annotations.Persistent;
import javax.jdo.annotations.PrimaryKey;

import rocky.common.Constant;

import com.google.appengine.api.datastore.Text;

/**
 * This entity is model of module which is displayed as tab in the web page.
 * 
 * @author Thach Le
 */
@PersistenceCapable
public class ModuleDTO extends BaseDTO implements Serializable {

    /** Physical primary key of the object. */
    @PrimaryKey
    @Persistent(valueStrategy = IdGeneratorStrategy.IDENTITY)
    private Long key;

    /** Identifier of the module. */
    @Persistent
    private String id;

    /**
     * Name of the module. This name is the key of displayed title/ Ex: Tab "Intro" has the title "Giới thiệu" which is
     * in the resource properties file of Vietnamese. For resource properties English, this tab has the title
     * "Introduction".
     */
    @Persistent
    private String name;

    /**
     * Language code of the content. For each language, the content has coresponsive value. Examples value of lang: vn,
     * en These values are the suffix of the property file name.
     */
    @Persistent
    private String lang;

    /** Rich-text content of the module/tab. */
    @Persistent
    private Text content;
    
    @Persistent
    private int order;

    @Persistent
    private Date created;

    @Persistent
    private String createdBy;

    @Persistent
    private Date lastModified;

    @Persistent
    private String lastModifiedBy;

    /**
     * @param moduleId
     * @param name
     * @param introContent
     */
    public ModuleDTO(String moduleId, String name, Text introContent) {
        this.id = moduleId;
        this.name = name;
        this.content = introContent;
    }
    /**
     * Get the key of object.
     * 
     * @return Long
     */
    public Long getKey() {
        return key;
    }

    /**
     * Set the key for object.
     * 
     * @param key Long
     */
    public void setKey(Long key) {
        this.key = key;
    }

    /**
     * Get identifier of object.
     * 
     * @return String of identifier
     */
    public String getId() {
        return id;
    }

    /**
     * Set the identifier for the object.
     * 
     * @param id String of identifier
     */
    public void setId(String id) {
        this.id = id;
    }

    /**
     * Get name of the module.
     * 
     * @return String of module name
     */
    public String getName() {
        return name;
    }

    /**
     * Set name for the module.
     * 
     * @param name String of module name
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Get language code of the module.
     * 
     * @return short code of language
     */
    public String getLang() {
        return lang;
    }

    /**
     * Set language code for the module.
     * 
     * @param lang short code of language
     */
    public void setLang(String lang) {
        this.lang = lang;
    }

    /**
     * Get rich text format content of the module.
     * 
     * @return Rich text format content
     */
    public Text getContent() {
        return content;
    }

    public int getOrder() {
        return order;
    }
    public void setOrder(int order) {
        this.order = order;
    }
    /**
     * Get the String format of content.
     * 
     * @return if the content is null, return BLANK string
     */
    public String getStringContent() {
        return ((content != null) ? content.getValue() : Constant.BLANK);
    }
    /**
     * Set content for the module.
     * 
     * @param content rich text format content
     */
    public void setContent(Text content) {
        this.content = content;
    }

    /**
     * Set content for the module.
     * 
     * @param content String of rich text format
     */
    public void setContent(String content) {
        this.content = new Text(content);
    }

    /**
     * Explain the description for this method here
     * 
     * @see openones.gate.store.dto.BaseDTO#getCreated()
     */
    @Override
    public Date getCreated() {
        return created;
    }
    
    /**
     * Explain the description for this method here
     * 
     * @see openones.gate.store.dto.BaseDTO#setCreated(java.util.Date)
     */
    @Override
    public void setCreated(Date created) {
        this.created = created;

    }
    
    /**
     * Explain the description for this method here
     * 
     * @see openones.gate.store.dto.BaseDTO#getCreatedBy()
     */
    @Override
    public String getCreatedBy() {
        return createdBy;
    }
    
    /**
     * Explain the description for this method here
     * 
     * @see openones.gate.store.dto.BaseDTO#setCreatedBy(java.lang.String)
     */
    @Override
    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }
    
    /**
     * Explain the description for this method here
     * 
     * @see openones.gate.store.dto.BaseDTO#getLastModified()
     */
    @Override
    public Date getLastModified() {
        return lastModified;
    }
    
    /**
     * Explain the description for this method here
     * 
     * @see openones.gate.store.dto.BaseDTO#setLastModified(java.util.Date)
     */
    @Override
    public void setLastModified(Date lastModified) {
        this.lastModified = lastModified;
    }
    
    /**
     * Explain the description for this method here
     * 
     * @see openones.gate.store.dto.BaseDTO#getLastModifiedBy()
     */
    @Override
    public String getLastModifiedBy() {
        return lastModifiedBy;
    }
    
    /**
     * [Explain the description for this method here].
     * @param lastModifiedBy
     * @see openones.gate.store.dto.BaseDTO#setLastModifiedBy(java.util.Date)
     */
    @Override
    public void setLastModifiedBy(String lastModifiedBy) {
        this.lastModifiedBy = lastModifiedBy;
    }

}